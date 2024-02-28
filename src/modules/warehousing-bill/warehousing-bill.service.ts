import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import moment from 'moment';
import { In, IsNull, Not } from 'typeorm';
import { FilterDto } from '~/common/dtos/filter.dto';
import { ORDER_STATUS, PROPOSAL_STATUS, PROPOSAL_TYPE, WAREHOUSING_BILL_STATUS, WAREHOUSING_BILL_TYPE } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';
import { WarehousingBillEntity } from '~/database/typeorm/entities/warehousingBill.entity';
import { WarehousingBillEvent } from '~/modules/warehousing-bill/events/warehousing-bill.event';
import { UtilService } from '~/shared/services';
import { CreateWarehousingBillDto } from './dto/create-warehousing-bill.dto';
import { UpdateWarehousingBillDto } from './dto/update-warehousing-bill.dto';

@Injectable()
export class WarehousingBillService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    async create(createWarehousingBillDto: CreateWarehousingBillDto) {
        await this.checkValidType(createWarehousingBillDto.proposalId, createWarehousingBillDto.type);
        await this.isQuantityValid(createWarehousingBillDto);

        // if warehousing bill type is IMPORT and orderId is null, it's mean that the bill is created from proposal
        if (createWarehousingBillDto.type === WAREHOUSING_BILL_TYPE.IMPORT && createWarehousingBillDto.orderId) {
            await this.utilService.checkRelationIdExist({
                order: {
                    id: createWarehousingBillDto.orderId,
                    status: ORDER_STATUS.RECEIVED,
                    errorMessage: 'Không tìm thấy phiếu đặt hàng hoặc hàng chưa được nhận',
                },
            });
        }

        const entity = await this.database.warehousingBill.save(
            this.database.warehousingBill.create({
                ...createWarehousingBillDto,
                createdById: UserStorage.getId(),
                code: `${createWarehousingBillDto.type}-${moment().unix()}`,
            }),
        );
        this.createBillDetails(entity);

        // emit an event to notify that the warehousing bill is created
        this.emitEvent('warehousingBill.created', { id: entity.id });

        return entity;
    }

    async findAll(
        queries: FilterDto & {
            proposalId: number;
            warehouseId: number;
            orderId: number;
            type: WAREHOUSING_BILL_TYPE;
            status: WAREHOUSING_BILL_STATUS;
        },
    ) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.warehousingBill, queries);
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['proposalId', 'warehouseId', 'orderId', 'type', 'status']));

        builder.leftJoinAndSelect('entity.proposal', 'proposal');
        builder.leftJoinAndSelect('entity.order', 'order');
        builder.leftJoinAndSelect('entity.warehouse', 'warehouse');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.select([
            'entity',
            'proposal.id',
            'proposal.name',
            'order.id',
            'order.name',
            'warehouse.id',
            'warehouse.name',
            'createdBy.id',
            'createdBy.fullName',
            'updatedBy.id',
            'updatedBy.fullName',
        ]);

        const [result, total] = await builder.getManyAndCount();
        const totalPages = Math.ceil(total / take);
        return {
            data: result,
            pagination: {
                ...pagination,
                totalRecords: total,
                totalPages: totalPages,
            },
        };
    }

    findOne(id: number) {
        const builder = this.database.warehousingBill.createQueryBuilder('entity');
        builder.where({ id });
        builder.leftJoinAndSelect('entity.proposal', 'proposal');
        builder.leftJoinAndSelect('entity.order', 'order');
        builder.leftJoinAndSelect('entity.details', 'details');
        builder.leftJoinAndSelect('details.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.leftJoinAndSelect('entity.warehouse', 'warehouse');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.select([
            'entity',
            'proposal.id',
            'proposal.name',
            'order.id',
            'order.name',
            'details.id',
            'details.productId',
            'details.proposalQuantity',
            'details.actualQuantity',
            'product.id',
            'product.name',
            'unit.id',
            'unit.name',
            'warehouse.id',
            'warehouse.name',
            'createdBy.id',
            'createdBy.fullName',
            'updatedBy.id',
            'updatedBy.fullName',
        ]);
        return builder.getOne();
    }

    async update(id: number, updateWarehousingBillDto: UpdateWarehousingBillDto) {
        await this.isStatusValid({ id, statuses: [WAREHOUSING_BILL_STATUS.PENDING] });
        return this.database.warehousingBill.update(id, updateWarehousingBillDto);
    }

    async remove(id: number) {
        await this.isStatusValid({ id, statuses: [WAREHOUSING_BILL_STATUS.PENDING, WAREHOUSING_BILL_STATUS.REJECTED] });
        await this.database.warehousingBillDetail.delete({ warehousingBillId: id });
        return this.database.warehousingBill.delete(id);
    }

    async getDetails(queries: FilterDto & { warehousingBillId: number; productId: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.warehousingBillDetail, queries);
        builder.andWhere(this.utilService.fullTextSearch({ fields: ['product.name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.andWhere('entity.warehousingBillId = :id', { id: queries.warehousingBillId });
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['productId']));
        builder.select(['entity', 'product.id', 'product.name', 'product.code', 'unit.id', 'unit.name']);

        const [result, total] = await builder.getManyAndCount();
        const totalPages = Math.ceil(total / take);
        return {
            data: result,
            pagination: {
                ...pagination,
                totalRecords: total,
                totalPages: totalPages,
            },
        };
    }

    async approve(id: number) {
        // TODO: check if user have permission to approve
        // maybe use a table to store who can approve which proposal is created by who
        await this.isStatusValid({ id, statuses: [WAREHOUSING_BILL_STATUS.PENDING] });
        await this.database.warehousingBill.update(id, { status: WAREHOUSING_BILL_STATUS.APPROVED });
        await this.database.approvalProcess.save(
            this.database.approvalProcess.create({
                warehousingBillId: id,
                userId: UserStorage.getId(),
                from: PROPOSAL_STATUS.PENDING,
                to: PROPOSAL_STATUS.APPROVED,
            }),
        );

        // emit an event to notify that the warehousing bill is approved
        this.emitEvent('warehousingBill.approved', { id });

        return { message: 'Duyệt phiếu kho thành công', data: { id } };
    }

    async reject(id: number) {
        // TODO: check if user have permission to reject
        await this.isStatusValid({ id, statuses: [WAREHOUSING_BILL_STATUS.PENDING] });
        await this.database.warehousingBill.update(id, { status: WAREHOUSING_BILL_STATUS.REJECTED });
        await this.database.approvalProcess.save(
            this.database.approvalProcess.create({
                warehousingBillId: id,
                userId: UserStorage.getId(),
                from: PROPOSAL_STATUS.PENDING,
                to: PROPOSAL_STATUS.REJECTED,
            }),
        );

        // emit an event to notify that the warehousing bill is rejected
        this.emitEvent('warehousingBill.rejected', { id });

        return { message: 'Từ chối phiếu kho thành công', data: { id } };
    }

    async return(id: number) {
        // TODO: check if user have permission to return
        await this.isStatusValid({ id, statuses: [WAREHOUSING_BILL_STATUS.APPROVED], isTallied: true });
        await this.database.warehousingBill.update(id, { status: WAREHOUSING_BILL_STATUS.PENDING });
        await this.database.approvalProcess.save(
            this.database.approvalProcess.create({
                warehousingBillId: id,
                userId: UserStorage.getId(),
                from: PROPOSAL_STATUS.APPROVED,
                to: PROPOSAL_STATUS.PENDING,
            }),
        );

        // emit an event to notify that the warehousing bill is returned
        this.emitEvent('warehousingBill.returned', { id });

        return { message: 'Trả phiếu kho thành công', data: { id } };
    }

    async finish(id: number) {
        const bill = await this.isStatusValid({ id, statuses: [WAREHOUSING_BILL_STATUS.APPROVED] });
        const { result, nonTalliedProducts } = await this.isAllDetailsTallied(bill.id);
        if (!result) throw new HttpException('Còn sản phẩm chưa được kiểm đếm: ' + nonTalliedProducts.join(','), 400);

        await this.allDetailsTallied(bill.id, bill.proposalId, bill.orderId);

        // emit an event to notify that the tallying process is completed
        this.emitEvent('warehousingBill.finished', { id });

        return { message: 'Kiểm phiếu kho hoàn tất', data: { id } };
    }

    /**
     * Only update the actual quantity of the warehousing bill detail \
     * If the status of the warehousing bill is not approved, throw an error \
     */
    async tally(billId: number, detailId: number, actualQuantity: number) {
        if (isNaN(actualQuantity)) throw new HttpException('Số lượng thực tế không hợp lệ', 400);
        const detail = await this.database.warehousingBillDetail.findOneBy({ id: detailId, warehousingBillId: billId });
        if (!detail) throw new HttpException('Không tìm thấy chi tiết phiếu kho', 404);
        // if (detail.actualQuantity) throw new HttpException('Chi tiết phiếu kho đã được nhập kho', 400);
        // if (actualQuantity > detail.proposalQuantity) throw new HttpException('Số lượng thực tế không được lớn hơn số lượng đề xuất', 400);

        const bill = await this.database.warehousingBill.findOneBy({ id: detail.warehousingBillId });
        if (!bill) throw new HttpException('Không tìm thấy phiếu kho', 404);
        if (bill.status !== WAREHOUSING_BILL_STATUS.APPROVED) throw new HttpException('Phiếu kho chưa được duyệt hoặc đã được kiểm đếm', 400);

        await this.database.warehousingBillDetail.update(detail.id, { actualQuantity });

        return { message: 'Kiểm đếm phiếu kho thành công', data: { ...detail, actualQuantity } };
    }

    /**
     * Create warehousing bill details from proposal details
     * @param billEntity Warehousing bill entity
     */
    private async createBillDetails(billEntity: WarehousingBillEntity): Promise<void> {
        const proposalDetails = await this.database.proposalDetail.getDetailByProposalId(billEntity.proposalId);
        const details = proposalDetails.map((detail) => ({
            proposalId: billEntity.proposalId,
            warehousingBillId: billEntity.id,
            productId: detail.productId,
            proposalQuantity: detail.quantity,
        }));

        await this.database.warehousingBillDetail.save(this.database.warehousingBillDetail.create(details));
    }

    /**
     * Check if user can update or delete warehousing bills \
     * User must be the creator of the bills and the status must be the same as the one in the statuses array
     * @param id Warehousing bill id
     * @param statuses Array of valid statuses
     * @param userId (optional) Creator id
     * @returns Warehousing bill  entity
     */
    private async isStatusValid(data: { id: number; statuses: any[]; userId?: number; isTallied?: boolean }): Promise<WarehousingBillEntity> {
        const entity = await this.database.warehousingBill.findOneBy({ id: data.id });
        if (!entity) throw new HttpException('Không tìm thấy phiếu kho', 404);
        if (!data.statuses.includes(entity.status)) throw new HttpException('Không thể chỉnh sửa phiếu kho do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId) throw new HttpException('Bạn không có quyền chỉnh sửa đề xuất này', 403);
        if (data.isTallied) {
            const details = await this.database.warehousingBillDetail.countBy({ warehousingBillId: data.id, actualQuantity: Not(IsNull()) });
            if (details > 0) throw new HttpException('Không thể chỉnh sửa phiếu kho do đã kiểm đếm', 400);
        }
        return entity;
    }

    /**
     * Check if all details of a warehousing bill are tallied
     * @param billId Warehousing bill id
     */
    private async isAllDetailsTallied(billId: number) {
        const details = await this.database.warehousingBillDetail.findBy({ warehousingBillId: billId });
        const nonTalliedDetails = details.filter((detail) => detail.actualQuantity === null);
        return { result: nonTalliedDetails.length === 0, nonTalliedProducts: nonTalliedDetails.map((detail) => detail?.productId) };
    }

    /**
     * The function checks if the quantity of products in a warehousing bill is valid for an export
     * type bill.
     * @param {CreateWarehousingBillDto} data - The parameter `data` is of type
     * `CreateWarehousingBillDto`. It contains the following properties:
     */
    private async isQuantityValid(data: CreateWarehousingBillDto) {
        if (data.type === WAREHOUSING_BILL_TYPE.EXPORT) {
            const warehouse = await this.getWarehouseById(data.warehouseId);
            const proposalDetails = await this.getProposalDetails(data.proposalId);
            const productQuantitiesInDb = await this.getProductQuantitiesInDb(proposalDetails, data.warehouseId);

            // this.checkIfProductsExistInWarehouse(warehouse, proposalDetails, productQuantitiesInDb);
            this.checkIfProductQuantitiesAreEnough(proposalDetails, productQuantitiesInDb);
        }
    }

    private async getWarehouseById(warehouseId: number) {
        const warehouse = await this.database.warehouse.findOneBy({ id: warehouseId });
        if (!warehouse) {
            throw new HttpException('Không tìm thấy kho', 404);
        }
        return warehouse;
    }

    private async getProposalDetails(proposalId: number): Promise<{ productId: number; productName: string; quantity: number }[]> {
        const proposalDetails = await this.database.proposalDetail.getDetailByProposalId(proposalId);
        if (proposalDetails.length === 0) {
            throw new HttpException('Không tìm thấy chi tiết đề xuất', 400);
        }
        return proposalDetails;
    }

    private async getProductQuantitiesInDb(proposalDetails: { productId: number; productName: string; quantity: number }[], warehouseId: number) {
        const productIds = proposalDetails.map((detail) => detail.productId);
        const productQuantitiesInDb = await this.database.inventory.getQuantityByProductIds(productIds, warehouseId);
        if (productQuantitiesInDb.length === 0) {
            throw new HttpException(`Kho không có sản phẩm`, 400);
        }
        return productQuantitiesInDb;
    }

    private checkIfProductsExistInWarehouse(
        warehouse: WarehouseEntity,
        proposalDetails: { productId: number; productName: string; quantity: number }[],
        productQuantitiesInDb: { productId: number; productName: string; quantity: number }[],
    ) {
        const productsNotFound = proposalDetails.filter((detail) => !productQuantitiesInDb.some((product) => product.productId === detail.productId));
        if (productsNotFound.length > 0) {
            const productNames = productsNotFound.map((detail) => detail.productName).join(',');
            throw new HttpException(`Kho '${warehouse.name}' không có sản phẩm '${productNames}'`, 400);
        }
    }

    private checkIfProductQuantitiesAreEnough(
        proposalDetails: { productId: number; productName: string; quantity: number }[],
        productQuantitiesInDb: { productId: number; productName: string; quantity: number }[],
    ) {
        const productQuantitiesNotEnough = productQuantitiesInDb.filter((productQuantity) => {
            const proposalDetail = proposalDetails.find((detail) => detail.productId === productQuantity.productId);
            return productQuantity.quantity < (proposalDetail ? proposalDetail.quantity : 0);
        });
        if (productQuantitiesNotEnough.length > 0) {
            const errorMessage = productQuantitiesNotEnough
                .map((productQuantity) => {
                    const proposalDetail = proposalDetails.find((detail) => detail.productId === productQuantity.productId);
                    return `(${productQuantity.productId}) ${productQuantity.productName} (tồn: ${productQuantity.quantity}, đề xuất: ${
                        proposalDetail ? proposalDetail.quantity : 0
                    })`;
                })
                .join(',');
            throw new HttpException(`Số lượng sản phẩm ${errorMessage} không đủ. Vui lòng kiểm tra lại.`, 400);
        }
    }

    /**
     * Update the status of the warehousing bill and the proposal to completed \
     * Emit an event to notify that the tallying process is completed
     * @param billId Warehousing bill id
     * @param proposalId Proposal id
     * @returns Promise<void>
     * @emits tallying.completed
     */
    private async allDetailsTallied(billId: number, proposalId: number, orderId: number) {
        await this.database.warehousingBill.update(billId, { status: WAREHOUSING_BILL_STATUS.COMPLETED });
        this.database.approvalProcess.save(
            this.database.approvalProcess.create({
                warehousingBillId: billId,
                userId: UserStorage.getId(),
                from: PROPOSAL_STATUS.APPROVED,
                to: PROPOSAL_STATUS.COMPLETED,
            }),
        );

        await this.database.proposal.update(proposalId, { status: PROPOSAL_STATUS.COMPLETED });
        this.database.approvalProcess.save(
            this.database.approvalProcess.create({
                proposalId: proposalId,
                userId: UserStorage.getId(),
                from: PROPOSAL_STATUS.APPROVED,
                to: PROPOSAL_STATUS.COMPLETED,
            }),
        );

        if (orderId) {
            await this.database.order.update(orderId, { status: ORDER_STATUS.COMPLETED });
            this.database.orderProgressTracking.save({ orderId, status: ORDER_STATUS.CANCELLED, trackingDate: new Date() });
        }

        this.updateInventory(billId);
    }

    /**
     * Update inventory when tallying completed \
     * It's not a good practice to call this function directly from controller, it will cause a lot of problems
     * @param warehousingBillId - Warehousing bill id
     * @returns void
     */
    private async updateInventory(warehousingBillId: number): Promise<void> {
        const bill = await this.getCompletedWarehousingBill(warehousingBillId);
        if (!bill) return;

        const billProducts = this.extractBillProducts(bill);

        const inventories = await this.findInventoriesByProductIds(billProducts.map((product) => product.productId));
        const { updatedInventories, newInventories } = this.updateOrCreateInventories(bill, billProducts, inventories);

        await Promise.all([this.database.inventory.save(updatedInventories), this.database.inventory.save(newInventories)]);

        const inventoryHistories = this.createInventoryHistories(bill, billProducts, updatedInventories, newInventories);
        await this.database.inventoryHistory.save(inventoryHistories);
    }

    private async getCompletedWarehousingBill(warehousingBillId: number) {
        return await this.database.warehousingBill.findOne({
            where: { id: warehousingBillId, status: WAREHOUSING_BILL_STATUS.COMPLETED },
            relations: ['details'],
        });
    }

    private extractBillProducts(bill: WarehousingBillEntity) {
        return bill.details.map((detail) => ({
            productId: detail.productId,
            actualQuantity: detail.actualQuantity,
        }));
    }

    private findInventoriesByProductIds(productIds: number[]) {
        return this.database.inventory.findBy({ productId: In(productIds) });
    }

    private updateOrCreateInventories(
        bill: WarehousingBillEntity,
        billProducts: { productId: number; actualQuantity: number }[],
        inventories: InventoryEntity[],
    ) {
        const updatedInventories: Partial<InventoryEntity>[] = [];
        const newInventories: Partial<InventoryEntity>[] = [];

        billProducts.forEach((billProduct) => {
            const inventory = inventories.find((inv) => inv.productId === billProduct.productId);
            const change = this.getChangeQuantity(bill.type, billProduct.actualQuantity);

            if (inventory) {
                updatedInventories.push({
                    ...inventory,
                    quantity: inventory.quantity + change,
                });
            } else {
                newInventories.push({
                    productId: billProduct.productId,
                    warehouseId: bill.warehouseId,
                    quantity: change,
                    createdById: UserStorage.getId(),
                });
            }
        });

        return { updatedInventories, newInventories };
    }

    private createInventoryHistories(
        bill: WarehousingBillEntity,
        billProducts: any[],
        updatedInventories: Partial<InventoryEntity>[],
        newInventories: Partial<InventoryEntity>[],
    ) {
        const inventoryHistories = [];

        billProducts.forEach((billProduct, index) => {
            const inventory =
                updatedInventories.find((inv) => inv.productId === billProduct.productId) ||
                newInventories.find((inv) => inv.productId === billProduct.productId);
            const change = this.getChangeQuantity(bill.type, billProduct.actualQuantity);
            inventoryHistories.push({
                inventoryId: inventory.id,
                from: inventory.quantity - change,
                to: inventory.quantity,
                change: change,
                updatedById: UserStorage.getId(),
                type: bill.type,
                note: JSON.stringify({ proposalId: bill.proposalId, warehousingBillId: bill.id }),
            });
        });

        return inventoryHistories;
    }

    private getChangeQuantity(billType: WAREHOUSING_BILL_TYPE, actualQuantity: number) {
        switch (billType) {
            case WAREHOUSING_BILL_TYPE.IMPORT:
                return actualQuantity;
            case WAREHOUSING_BILL_TYPE.EXPORT:
                return -actualQuantity;
        }
    }

    private async checkValidType(proposalId: number, wbType: WAREHOUSING_BILL_TYPE) {
        const proposal = await this.database.proposal.findOneBy({ id: proposalId, status: PROPOSAL_STATUS.APPROVED });
        if (!proposal) throw new HttpException('Không tìm thấy phiếu đề xuất hoặc phiếu đề xuất chưa được duyệt', 400);
        const count = await this.database.warehousingBill.countBy({ proposalId });
        if (count > 0) throw new HttpException('Phiếu đề xuất đã được tạo phiếu nhập kho', 400);

        switch (proposal.type) {
            case PROPOSAL_TYPE.PURCHASE:
                if (wbType !== WAREHOUSING_BILL_TYPE.IMPORT)
                    throw new HttpException('Loại phiếu kho không hợp lệ, chỉ có thể tạo phiếu nhập kho từ phiếu mua hàng', 400);
                break;
            case PROPOSAL_TYPE.REPAIR:
                if (wbType !== WAREHOUSING_BILL_TYPE.EXPORT)
                    throw new HttpException('Loại phiếu kho không hợp lệ, chỉ có thể tạo phiếu xuất kho từ phiếu sửa chữa', 400);
                break;
            case PROPOSAL_TYPE.SUPPLY:
                if (wbType !== WAREHOUSING_BILL_TYPE.EXPORT)
                    throw new HttpException('Loại phiếu kho không hợp lệ, chỉ có thể tạo phiếu xuất kho từ phiếu xuất hàng', 400);
                break;
        }
    }

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new WarehousingBillEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }
}
