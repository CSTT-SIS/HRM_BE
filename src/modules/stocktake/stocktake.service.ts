import { HttpException, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { STOCKTAKE_STATUS } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { CreateStocktakeDetailDto } from '~/modules/stocktake/dto/create-stocktake-detail.dto';
import { TallyStocktakeDetailDto } from '~/modules/stocktake/dto/tally-stocktake-detail.dto';
import { UpdateStocktakeDetailDto } from '~/modules/stocktake/dto/update-stocktake-detail.dto';
import { UtilService } from '~/shared/services';
import { CreateStocktakeDto } from './dto/create-stocktake.dto';
import { UpdateStocktakeDto } from './dto/update-stocktake.dto';

@Injectable()
export class StocktakeService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    async create(createStocktakeDto: CreateStocktakeDto) {
        const { participants, ...rest } = createStocktakeDto;
        await this.utilService.checkRelationIdExist({ user: { id: In(participants), errorMessage: 'Người tham gia không tồn tại' } });
        const entity = await this.database.stocktake.save(
            this.database.stocktake.create({ ...rest, status: STOCKTAKE_STATUS.DRAFT, createdById: UserStorage.getId() }),
        );
        this.database.stocktake.addParticipants(entity.id, participants);
        return entity;
    }

    async findAll(queries: { page: number; perPage: number; search: string; sortBy: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.stocktake, queries);

        if (!this.utilService.isEmpty(queries.search))
            builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('entity.participants', 'participants');
        builder.select([
            'entity',
            'createdBy.id',
            'createdBy.fullName',
            'updatedBy.id',
            'updatedBy.fullName',
            'participants.id',
            'participants.fullName',
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
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('entity.participants', 'participants');
        builder.leftJoinAndSelect('entity.details', 'details');
        builder.leftJoinAndSelect('details.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.select([
            'entity',
            'createdBy.id',
            'createdBy.fullName',
            'updatedBy.id',
            'updatedBy.fullName',
            'participants',
            'details.id',
            'details.productId',
            'details.countedQuantity',
            'details.quantityDifference',
            'details.note',
            'product.id',
            'product.name',
            'product.code',
            'product.price',
            'product.tax',
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

    async addDetail(id: number, createStocktakeDetailDto: CreateStocktakeDetailDto) {
        await this.utilService.checkRelationIdExist({
            stocktake: {
                id,
                status: STOCKTAKE_STATUS.DRAFT,
                errorMessage: 'Phiếu kiểm kê không tồn tại hoặc không ở trạng thái nháp',
            },
            product: createStocktakeDetailDto.productId,
        });

        return this.database.stocktakeDetail.save(this.database.stocktakeDetail.create(createStocktakeDetailDto));
    }

    async updateDetail(id: number, detailId: number, updateStocktakeDetailDto: UpdateStocktakeDetailDto) {
        await this.utilService.checkRelationIdExist({
            stocktake: {
                id,
                status: STOCKTAKE_STATUS.DRAFT,
                errorMessage: 'Phiếu kiểm kê không tồn tại hoặc không ở trạng thái nháp',
            },
            product: updateStocktakeDetailDto.productId,
            stocktakeDetail: detailId,
        });

        return this.database.stocktakeDetail.update(detailId, updateStocktakeDetailDto);
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

    async start(id: number) {
        return this.updateStatus({ id, from: STOCKTAKE_STATUS.DRAFT, to: STOCKTAKE_STATUS.IN_PROGRESS });
    }

    async cancel(id: number) {
        return this.updateStatus({ id, from: STOCKTAKE_STATUS.IN_PROGRESS, to: STOCKTAKE_STATUS.DRAFT });
    }

    async finish(id: number) {
        return this.updateStatus({ id, from: STOCKTAKE_STATUS.IN_PROGRESS, to: STOCKTAKE_STATUS.FINISHED });
    }

    async approve(id: number) {
        return this.updateStatus({ id, from: STOCKTAKE_STATUS.FINISHED, to: STOCKTAKE_STATUS.APPROVED });
    }

    async reject(id: number) {
        return this.updateStatus({ id, from: STOCKTAKE_STATUS.FINISHED, to: STOCKTAKE_STATUS.REJECTED });
    }

    async tally(id: number, detailId: number, tallyDto: TallyStocktakeDetailDto) {
        return this.database.stocktakeDetail.update({ id: detailId, stocktakeId: id }, { ...tallyDto, updatedById: UserStorage.getId() });
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
        return this.database.stocktake.update(data.id, { status: data.to, updatedById: UserStorage.getId() });
    }
}
