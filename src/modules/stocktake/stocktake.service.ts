import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { In } from 'typeorm';
import { FilterDto } from '~/common/dtos/filter.dto';
import { INVENTORY_HISTORY_TYPE, STOCKTAKE_STATUS } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { CreateStocktakeDetailDto, CreateStocktakeDetailsDto } from '~/modules/stocktake/dto/create-stocktake-detail.dto';
import { TallyStocktakeDetailDto } from '~/modules/stocktake/dto/tally-stocktake-detail.dto';
import { UpdateStocktakeDetailDto } from '~/modules/stocktake/dto/update-stocktake-detail.dto';
import { StocktakeEvent } from '~/modules/stocktake/events/stocktake.event';
import { UtilService } from '~/shared/services';
import { CreateStocktakeDto } from './dto/create-stocktake.dto';
import { UpdateStocktakeDto } from './dto/update-stocktake.dto';

@Injectable()
export class StocktakeService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    async create(createStocktakeDto: CreateStocktakeDto) {
        // has possible to add multiple warehouses
        const { participants, ...rest } = createStocktakeDto;
        await this.utilService.checkRelationIdExist({ user: { id: In(participants), errorMessage: 'Người tham gia không tồn tại' } });
        const entity = await this.database.stocktake.save(
            this.database.stocktake.create({ ...rest, status: STOCKTAKE_STATUS.DRAFT, createdById: UserStorage.getId() }),
        );
        this.database.stocktake.addParticipants(entity.id, participants);

        // notify all participants
        this.emitEvent('stocktake.created', { id: entity.id });

        return entity;
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.stocktake, queries);

        if (!this.utilService.isEmpty(queries.search))
            builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndSelect('entity.participants', 'participants');
        builder.leftJoinAndSelect('participants.department', 'pDepartment');
        builder.leftJoinAndSelect('entity.warehouse', 'warehouse');
        builder.select([
            'entity',
            'createdBy.id',
            'createdBy.fullName',
            'cbDepartment.id',
            'cbDepartment.name',
            'updatedBy.id',
            'updatedBy.fullName',
            'ubDepartment.id',
            'ubDepartment.name',
            'participants.id',
            'participants.fullName',
            'pDepartment.id',
            'pDepartment.name',
            'warehouse.id',
            'warehouse.name',
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
        const builder = this.database.stocktake.createQueryBuilder('entity');
        builder.where('entity.id = :id', { id });
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndSelect('entity.participants', 'participants');
        builder.leftJoinAndSelect('participants.department', 'pDepartment');
        builder.leftJoinAndSelect('entity.warehouse', 'warehouse');
        builder.leftJoinAndSelect('entity.details', 'details');
        builder.leftJoinAndSelect('details.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.select([
            'entity',
            'createdBy.id',
            'createdBy.fullName',
            'cbDepartment.id',
            'cbDepartment.name',
            'updatedBy.id',
            'updatedBy.fullName',
            'ubDepartment.id',
            'ubDepartment.name',
            'participants',
            'pDepartment.id',
            'pDepartment.name',
            'warehouse.id',
            'warehouse.name',
            'details.id',
            'details.productId',
            'details.openingQuantity',
            'details.countedQuantity',
            'details.quantityDifference',
            'details.note',
            'product.id',
            'product.name',
            'product.code',
            'product.quantity',
            'unit.id',
            'unit.name',
        ]);
        return builder.getOne();
    }

    async update(id: number, updateStocktakeDto: UpdateStocktakeDto) {
        const { participants, ...rest } = updateStocktakeDto;
        const entity = await this.database.stocktake.findOne({ where: { id, status: STOCKTAKE_STATUS.DRAFT } });
        if (!entity) throw new HttpException('Phiếu kiểm kê không tồn tại hoặc không ở trạng thái nháp', 400);
        if (!this.utilService.isEmpty(participants)) {
            await this.utilService.checkRelationIdExist({ user: { id: In(participants), errorMessage: 'Người tham gia không tồn tại' } });
            await this.database.stocktake.removeAllParticipants(id);
            await this.database.stocktake.addParticipants(id, participants);
        }
        return this.database.stocktake.update(id, { ...rest, updatedById: UserStorage.getId() });
    }

    async remove(id: number) {
        const entity = await this.database.stocktake.findOne({ where: { id, status: STOCKTAKE_STATUS.DRAFT } });
        if (!entity) throw new HttpException('Phiếu kiểm kê không tồn tại hoặc không ở trạng thái nháp', 400);

        this.database.stocktake.removeAllParticipants(id);
        return this.database.stocktake.delete(id);
    }

    async autoAddDetail(id: number) {
        const entity = await this.database.stocktake.findOne({ where: { id, status: STOCKTAKE_STATUS.DRAFT } });
        if (!entity) throw new HttpException('Phiếu kiểm kê không tồn tại hoặc không ở trạng thái nháp', 400);

        const stocktakeDetails = await this.database.stocktakeDetail.find({ where: { stocktakeId: id } });
        const products = await this.database.inventory.getOpeningQuantities(entity.warehouseId, entity.startDate, entity.endDate);
        const details = products.map((product) => {
            const stocktakeDetail = stocktakeDetails.find((detail) => detail.productId === product.productId);
            if (!stocktakeDetail) {
                return {
                    stocktakeId: id,
                    productId: product.productId,
                    openingQuantity: parseFloat(product.opening || product.current) || 0,
                    createdById: UserStorage.getId(),
                };
            }
        });

        return this.database.stocktakeDetail.save(this.database.stocktakeDetail.create(details));
    }

    async getDetails(queries: FilterDto & { stocktakeId: number; productId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.stocktakeDetail, queries);
        if (!this.utilService.isEmpty(queries.search))
            builder.andWhere(this.utilService.fullTextSearch({ fields: ['product.name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.andWhere('entity.stocktakeId = :id', { id: queries.stocktakeId });
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['productId']));
        builder.select(['entity', 'product.id', 'product.name', 'product.code', 'product.quantity', 'unit.id', 'unit.name']);

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

    async addDetail(id: number, createStocktakeDetailDto: CreateStocktakeDetailDto) {
        const entity = await this.database.stocktake.findOne({ where: { id, status: STOCKTAKE_STATUS.DRAFT } });
        if (!entity) throw new HttpException('Phiếu kiểm kê không tồn tại hoặc không ở trạng thái nháp', 400);
        const count = await this.database.stocktakeDetail.countBy({ stocktakeId: id, productId: createStocktakeDetailDto.productId });
        if (count) throw new HttpException('Sản phẩm đã tồn tại trong phiếu kiểm kê', 400);
        const product = await this.database.inventory.getOpeningQuantity(
            entity.warehouseId,
            createStocktakeDetailDto.productId,
            entity.startDate,
            entity.endDate,
        );

        return this.database.stocktakeDetail.save(
            this.database.stocktakeDetail.create({
                ...createStocktakeDetailDto,
                stocktakeId: id,
                openingQuantity: createStocktakeDetailDto.openingQuantity || product.opening || product.current,
                createdById: UserStorage.getId(),
            }),
        );
    }

    async addDetails(id: number, createStocktakeDetailsDto: CreateStocktakeDetailsDto) {
        const entity = await this.database.stocktake.findOne({ where: { id, status: STOCKTAKE_STATUS.DRAFT } });
        if (!entity) throw new HttpException('Phiếu kiểm kê không tồn tại hoặc không ở trạng thái nháp', 400);

        const results = [];
        for (const detail of createStocktakeDetailsDto.details) {
            if (!detail.productId) throw new HttpException('Mã sản phẩm không được để trống', 400);
            const isProductExist = await this.database.product.findOne({ where: { id: detail.productId } });
            if (!isProductExist) throw new HttpException('Mã sản phẩm không tồn tại', 400);

            const count = await this.database.stocktakeDetail.countBy({ stocktakeId: id, productId: detail.productId });
            if (count) throw new HttpException('Sản phẩm đã tồn tại trong phiếu kiểm kê', 400);

            const product = await this.database.inventory.getOpeningQuantity(entity.warehouseId, detail.productId, entity.startDate, entity.endDate);
            results.push(
                await this.database.stocktakeDetail.save(
                    this.database.stocktakeDetail.create({
                        ...detail,
                        stocktakeId: id,
                        openingQuantity: detail.openingQuantity || product.opening || product.current,
                        createdById: UserStorage.getId(),
                    }),
                ),
            );
        }

        return results;
    }

    async updateDetail(id: number, detailId: number, updateStocktakeDetailDto: UpdateStocktakeDetailDto) {
        const entity = await this.database.stocktake.findOne({ where: { id, status: STOCKTAKE_STATUS.DRAFT } });
        if (!entity) throw new HttpException('Phiếu kiểm kê không tồn tại hoặc không ở trạng thái nháp', 400);
        const product = await this.database.inventory.getOpeningQuantity(
            entity.warehouseId,
            updateStocktakeDetailDto.productId,
            entity.startDate,
            entity.endDate,
        );

        return this.database.stocktakeDetail.update(detailId, {
            ...updateStocktakeDetailDto,
            openingQuantity: updateStocktakeDetailDto.openingQuantity || product.opening || product.current,
            updatedById: UserStorage.getId(),
        });
    }

    async removeDetail(id: number, detailId: number) {
        await this.utilService.checkRelationIdExist({
            stocktake: {
                id: id,
                status: STOCKTAKE_STATUS.DRAFT,
                errorMessage: 'Phiếu kiểm kê không tồn tại hoặc không ở trạng thái nháp',
            },
        });

        return this.database.stocktakeDetail.delete({ id: detailId, stocktakeId: id });
    }

    start(id: number) {
        return this.updateStatus({ id, from: STOCKTAKE_STATUS.DRAFT, to: STOCKTAKE_STATUS.IN_PROGRESS });
    }

    cancel(id: number) {
        return this.updateStatus({ id, from: STOCKTAKE_STATUS.IN_PROGRESS, to: STOCKTAKE_STATUS.DRAFT });
    }

    async finish(id: number) {
        const details = await this.database.stocktakeDetail.find({ where: { stocktakeId: id } });
        const notTallied = details.filter((detail) => detail.countedQuantity === null);
        if (notTallied.length)
            throw new HttpException('Có sản phẩm chưa được kiểm kê: ' + notTallied.map((detail) => detail.productId).join(', '), 400);

        return this.updateStatus({ id, from: STOCKTAKE_STATUS.IN_PROGRESS, to: STOCKTAKE_STATUS.FINISHED });
    }

    async approve(id: number) {
        const res = await this.updateStatus({ id, from: STOCKTAKE_STATUS.FINISHED, to: STOCKTAKE_STATUS.APPROVED });
        // update inventory based on stocktake details
        this.updateInventory(id);
        return res;
    }

    reject(id: number) {
        return this.updateStatus({ id, from: STOCKTAKE_STATUS.FINISHED, to: STOCKTAKE_STATUS.REJECTED });
    }

    async tally(id: number, detailId: number, tallyDto: TallyStocktakeDetailDto) {
        const detail = await this.database.stocktakeDetail.findOne({
            where: {
                id: detailId,
                stocktakeId: id,
                stocktake: { status: STOCKTAKE_STATUS.IN_PROGRESS },
            },
            relations: ['stocktake'],
        });

        if (!detail) throw new HttpException('Chi tiết kiểm kê không tồn tại hoặc không ở trạng thái phù hợp', 400);
        if (detail.countedQuantity !== null) throw new HttpException('Chi tiết kiểm kê đã được kiểm kê', 400);

        return this.database.stocktakeDetail.update(
            { id: detailId, stocktakeId: id },
            {
                ...tallyDto,
                quantityDifference: tallyDto.countedQuantity - detail.openingQuantity,
                updatedById: UserStorage.getId(),
            },
        );
    }

    private async updateStatus(data: { id: number; from: STOCKTAKE_STATUS; to: STOCKTAKE_STATUS }) {
        await this.utilService.checkRelationIdExist({
            stocktake: {
                id: data.id,
                status: data.from,
                errorMessage: 'Phiếu kiểm kê không tồn tại hoặc không ở trạng thái phù hợp',
            },
        });
        this.database.approvalProcess.save(
            this.database.approvalProcess.create({
                stocktakeId: data.id,
                from: data.from,
                to: data.to,
                userId: UserStorage.getId(),
            }),
        );

        // emit event
        this.emitEventByStatus(data.to, { id: data.id });

        return this.database.stocktake.update(data.id, { status: data.to, updatedById: UserStorage.getId() });
    }

    private async updateInventory(id) {
        const entity = await this.database.stocktake.findOne({ where: { id } });
        const details = await this.database.stocktakeDetail.find({ where: { stocktakeId: id } });
        const products = details.map((detail) => ({
            detailId: detail.id,
            productId: detail.productId,
            actualQuantity: detail.countedQuantity,
        }));
        const inventories = await this.database.inventory.findBy({ productId: In(products.map((product) => product.productId)) });

        const inventoryHistories = [];
        const updatedInventories = products
            .map((product) => {
                const inventory = inventories.find((inventory) => inventory.productId === product.productId);
                const change = product.actualQuantity - (inventory?.quantity || 0);
                if (inventory) {
                    inventoryHistories.push(
                        this.database.inventoryHistory.create({
                            inventoryId: inventory.id,
                            from: inventory.quantity,
                            to: inventory.quantity + change,
                            change: change,
                            updatedById: UserStorage.getId(),
                            type: INVENTORY_HISTORY_TYPE.STOCKTAKE,
                            note: JSON.stringify({ stocktakeId: id, stocktakeDetailId: product.detailId }),
                        }),
                    );
                    return {
                        ...inventory,
                        quantity: inventory.quantity + change,
                    };
                }

                return null;
            })
            .filter((inventory) => inventory !== null);

        this.database.inventory.save(updatedInventories);
        this.database.inventoryHistory.save(inventoryHistories);
        //notify limits
        this.utilService.notifyLimits(updatedInventories);
    }

    private emitEventByStatus(status: STOCKTAKE_STATUS, data: { id: number }) {
        switch (status) {
            case STOCKTAKE_STATUS.DRAFT:
                this.emitEvent('stocktake.cancelled', data);
                break;
            case STOCKTAKE_STATUS.IN_PROGRESS:
                this.emitEvent('stocktake.started', data);
                break;
            case STOCKTAKE_STATUS.FINISHED:
                this.emitEvent('stocktake.finished', data);
                break;
            case STOCKTAKE_STATUS.APPROVED:
                this.emitEvent('stocktake.approved', data);
                break;
            case STOCKTAKE_STATUS.REJECTED:
                this.emitEvent('stocktake.rejected', data);
                break;
        }
    }

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new StocktakeEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }
}
