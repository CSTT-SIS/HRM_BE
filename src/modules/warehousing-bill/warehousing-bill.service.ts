import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { In, IsNull, Not } from 'typeorm';
import { PROPOSAL_STATUS, WAREHOUSING_BILL_STATUS, WAREHOUSING_BILL_TYPE } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { WarehousingBillEntity } from '~/database/typeorm/entities/warehousingBill.entity';
import { UtilService } from '~/shared/services';
import { CreateWarehousingBillDto } from './dto/create-warehousing-bill.dto';
import { UpdateWarehousingBillDto } from './dto/update-warehousing-bill.dto';

@Injectable()
export class WarehousingBillService {
    constructor(
        private readonly utilService: UtilService,
        private readonly database: DatabaseService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async create(createWarehousingBillDto: CreateWarehousingBillDto) {
        await this.utilService.checkRelationIdExist({
            proposal: {
                id: createWarehousingBillDto.proposalId,
                status: PROPOSAL_STATUS.APPROVED,
                errorMessage: 'Không tìm thấy phiếu đề xuất hoặc phiếu đề xuất chưa được duyệt',
            },
            warehouse: createWarehousingBillDto.warehouseId,
        });

        const check = await this.database.warehousingBill.countBy({ proposalId: createWarehousingBillDto.proposalId });
        if (check > 0) {
            throw new HttpException('Phiếu đề xuất đã được tạo phiếu nhập kho', 400);
        }

        await this.isQuantityValid(createWarehousingBillDto);

        const entity = await this.database.warehousingBill.save(
            this.database.warehousingBill.create({ ...createWarehousingBillDto, createdById: UserStorage.getId() }),
        );
        this.createBillDetails(entity);

        return entity;
    }

    async findAll(queries: {
        page: number;
        perPage: number;
        search: string;
        sortBy: string;
        proposalId: number;
        warehouseId: number;
        type: WAREHOUSING_BILL_TYPE;
        status: WAREHOUSING_BILL_STATUS;
    }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.warehousingBill, queries);
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['proposalId', 'warehouseId', 'type', 'status']));

        builder.leftJoinAndSelect('entity.proposal', 'proposal');
        builder.leftJoinAndSelect('entity.warehouse', 'warehouse');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.select([
            'entity',
            'proposal.id',
            'proposal.name',
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
        await this.utilService.checkRelationIdExist({ warehouse: updateWarehousingBillDto.warehouseId });
        return this.database.warehousingBill.update(id, updateWarehousingBillDto);
    }

    async remove(id: number) {
        await this.isStatusValid({ id, statuses: [WAREHOUSING_BILL_STATUS.PENDING, WAREHOUSING_BILL_STATUS.REJECTED] });
        await this.database.warehousingBillDetail.delete({ warehousingBillId: id });
        return this.database.warehousingBill.delete(id);
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

        return { message: 'Trả phiếu kho thành công', data: { id } };
    }

    async finish(id: number) {
        const bill = await this.isStatusValid({ id, statuses: [WAREHOUSING_BILL_STATUS.APPROVED] });
        const { result, nonTalliedProducts } = await this.isAllDetailsTallied(bill.id);
        if (!result) throw new HttpException('Còn sản phẩm chưa được kiểm đếm: ' + nonTalliedProducts.join(', '), 400);

        this.allDetailsTallied(bill.id, bill.proposalId);

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
     * Check if the quantity of products in the warehouse is enough \
     * If the quantity is not enough, throw an error
     * @param data - CreateWarehousingBillDto
     */
    private async isQuantityValid(data: CreateWarehousingBillDto) {
        if (data.type === WAREHOUSING_BILL_TYPE.EXPORT) {
            const proposalDetails = await this.database.proposalDetail.getDetailByProposalId(data.proposalId);
            const productIds = proposalDetails.map((detail) => detail.productId);
            const productQuantitiesInDb = await this.database.inventory.getQuantityByProductIds(productIds, data.warehouseId);
            const productQuantitiesNotEnough = productQuantitiesInDb.filter(
                (productQuantity) =>
                    productQuantity.quantity < proposalDetails.find((detail) => detail.productId === productQuantity.productId).quantity,
            );
            if (productQuantitiesNotEnough.length > 0) {
                throw new HttpException(
                    `Số lượng sản phẩm '${productQuantitiesNotEnough
                        .map(
                            (productQuantity) =>
                                productQuantity.productId +
                                ' (tồn: ' +
                                productQuantity.quantity +
                                ', đề xuất: ' +
                                proposalDetails.find((detail) => detail.productId === productQuantity.productId).quantity +
                                ')',
                        )
                        .join(', ')}' không đủ. Vui lòng kiểm tra lại.`,
                    400,
                );
            }
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
    private async allDetailsTallied(billId: number, proposalId: number) {
        await this.database.warehousingBill.update(billId, { status: WAREHOUSING_BILL_STATUS.COMPLETED });
        await this.database.approvalProcess.save(
            this.database.approvalProcess.create({
                warehousingBillId: billId,
                userId: UserStorage.getId(),
                from: PROPOSAL_STATUS.APPROVED,
                to: PROPOSAL_STATUS.COMPLETED,
            }),
        );

        await this.database.proposal.update(proposalId, { status: PROPOSAL_STATUS.COMPLETED });
        await this.database.approvalProcess.save(
            this.database.approvalProcess.create({
                proposalId: proposalId,
                userId: UserStorage.getId(),
                from: PROPOSAL_STATUS.APPROVED,
                to: PROPOSAL_STATUS.COMPLETED,
            }),
        );

        this.updateInventory(billId);
    }

    /**
     * Update inventory when tallying completed \
     * It's not a good practice to call this function directly from controller, it will cause a lot of problems
     * @param warehousingBillId - Warehousing bill id
     * @returns void
     */
    private async updateInventory(warehousingBillId: number): Promise<void> {
        const bill = await this.database.warehousingBill.findOne({
            where: { id: warehousingBillId, status: WAREHOUSING_BILL_STATUS.COMPLETED },
            relations: ['details'],
        });
        if (!bill) return;

        const billProducts = bill.details.map((detail) => ({
            productId: detail.productId,
            actualQuantity: detail.actualQuantity,
        }));

        const inventories = await this.database.inventory.findBy({ productId: In(billProducts.map((product) => product.productId)) });
        const inventoryHistories = [];
        const updatedInventories = billProducts.map((billProduct) => {
            const change = this.getChangeQuantity(bill.type, billProduct.actualQuantity);
            const inventory = inventories.find((inventory) => inventory.productId === billProduct.productId);
            if (inventory) {
                inventoryHistories.push(
                    this.database.inventoryHistory.create({
                        inventoryId: inventory.id,
                        from: inventory.quantity,
                        to: inventory.quantity + change,
                        change: change,
                        updatedById: UserStorage.getId(),
                        type: bill.type,
                        note: JSON.stringify({ proposalId: bill.proposalId, warehousingBillId: bill.id }),
                    }),
                );
                return {
                    ...inventory,
                    quantity: inventory.quantity + change,
                };
            }

            inventoryHistories.push(
                this.database.inventoryHistory.create({
                    inventoryId: inventory.id,
                    from: 0,
                    to: change,
                    change: change,
                    updatedById: UserStorage.getId(),
                    type: bill.type,
                    note: JSON.stringify({ proposalId: bill.proposalId, warehousingBillId: bill.id }),
                }),
            );
            return {
                productId: billProduct.productId,
                warehouseId: bill.warehouseId,
                quantity: change,
                createdById: UserStorage.getId(),
            };
        });

        this.database.inventory.save(updatedInventories);
        this.database.inventoryHistory.save(inventoryHistories);
    }

    private getChangeQuantity(billType: WAREHOUSING_BILL_TYPE, actualQuantity: number) {
        switch (billType) {
            case WAREHOUSING_BILL_TYPE.IMPORT:
                return actualQuantity;
            case WAREHOUSING_BILL_TYPE.EXPORT:
                return -actualQuantity;
        }
    }
}
