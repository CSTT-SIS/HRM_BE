import { HttpException, Injectable } from '@nestjs/common';
import moment from 'moment';
import { FilterDto } from '~/common/dtos/filter.dto';
import { REPAIR_REQUEST_STATUS } from '~/common/enums/enum';
import { DatabaseService } from '~/database/typeorm/database.service';
import { CreateRepairDetailDto } from '~/modules/repair-request/dto/create-repair-detail.dto';
import { UpdateRepairDetailDto } from '~/modules/repair-request/dto/update-repair-detail.dto';
import { UtilService } from '~/shared/services';
import { CreateRepairRequestDto } from './dto/create-repair-request.dto';
import { UpdateRepairRequestDto } from './dto/update-repair-request.dto';

@Injectable()
export class RepairRequestService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    async create(createRepairRequestDto: CreateRepairRequestDto) {
        const { vehicleRegistrationNumber, ...rest } = createRepairRequestDto;
        const registrationNumber = vehicleRegistrationNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const vehicle = await this.database.vehicle.findOrCreate(registrationNumber);
        const entity = await this.database.repairRequest.save(
            this.database.repairRequest.create({
                ...rest,
                name: `[${registrationNumber}] ${moment().unix()}`,
                vehicleId: vehicle.id,
                startDate: new Date(),
            }),
        );
        this.database.repairProgress.save(
            this.database.repairProgress.create({
                repairRequestId: entity.id,
                repairById: entity.repairById,
                status: entity.status,
                trackingDate: entity.createdAt,
            }),
        );

        return entity;
    }

    async findAll(queries: FilterDto & { repairById: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.repairRequest, queries);

        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['repairById']));
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name', 'vehicle.registrationNumber'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.vehicle', 'vehicle');
        builder.select(['entity', 'vehicle.id', 'vehicle.registrationNumber']);

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
        const builder = this.database.repairRequest.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.vehicle', 'vehicle');
        builder.leftJoinAndSelect('entity.repairBy', 'repairBy');
        builder.leftJoinAndSelect('entity.details', 'details');
        builder.leftJoinAndSelect('details.replacementPart', 'replacementPart');
        builder.leftJoinAndSelect('entity.progresses', 'progresses');
        builder.leftJoinAndSelect('progresses.user', 'progressUser');

        builder.select([
            'entity',
            'vehicle.id',
            'vehicle.registrationNumber',
            'repairBy.id',
            'repairBy.fullName',
            'details',
            'replacementPart.id',
            'replacementPart.name',
            'progresses',
            'progressUser.id',
            'progressUser.fullName',
        ]);

        builder.where({ id });
        return builder.getOne();
    }

    async update(id: number, updateRepairRequestDto: UpdateRepairRequestDto) {
        await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.PENDING] });
        const { vehicleRegistrationNumber, ...rest } = updateRepairRequestDto;
        const addUpdate = {};
        if (vehicleRegistrationNumber) {
            const registrationNumber = vehicleRegistrationNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            const vehicle = await this.database.vehicle.findOrCreate(registrationNumber);
            addUpdate['vehicleId'] = vehicle.id;
        }
        return this.database.repairRequest.update(id, { ...rest, ...addUpdate });
    }

    async remove(id: number) {
        await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.PENDING, REPAIR_REQUEST_STATUS.CANCELLED] });
        this.database.repairDetail.delete({ repairRequestId: id });
        this.database.repairProgress.delete({ repairRequestId: id });
        return this.database.repairRequest.delete(id);
    }

    async getDetails(queries: FilterDto & { requestId: number; productId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.repairDetail, queries);
        if (!this.utilService.isEmpty(queries.search))
            builder.andWhere(this.utilService.fullTextSearch({ fields: ['product.name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.andWhere('entity.repairRequestId = :id', { id: queries.requestId });
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['productId']));
        builder.select(['entity', 'product.id', 'product.name', 'unit.id', 'unit.name']);

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

    async addDetail(id: number, data: CreateRepairDetailDto) {
        await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.PENDING] });
        return this.database.repairDetail.save(
            this.database.repairDetail.create({ repairRequestId: id, replacementPartId: data.replacementPartId, quantity: data.quantity }),
        );
    }

    async updateDetail(id: number, detailId: number, data: UpdateRepairDetailDto) {
        await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.PENDING] });
        return this.database.repairDetail.update({ id: detailId, repairRequestId: id }, data);
    }

    async removeDetail(id: number, detailId: number) {
        await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.PENDING] });
        return this.database.repairDetail.delete({ id: detailId, repairRequestId: id });
    }

    async inProgress(id: number) {
        await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.PENDING] });
        const entity = await this.database.repairRequest.findOneBy({ id });
        if (!entity) throw new HttpException('Không tìm thấy phiếu sửa chữa', 404);

        this.database.repairProgress.save(
            this.database.repairProgress.create({
                repairRequestId: id,
                repairById: entity.repairById,
                status: REPAIR_REQUEST_STATUS.IN_PROGRESS,
                trackingDate: new Date(),
            }),
        );
        return this.database.repairRequest.update(id, { status: REPAIR_REQUEST_STATUS.IN_PROGRESS });
    }

    async complete(id: number) {
        await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.IN_PROGRESS] });
        const entity = await this.database.repairRequest.findOneBy({ id });
        if (!entity) throw new HttpException('Không tìm thấy phiếu sửa chữa', 404);

        this.database.repairProgress.save(
            this.database.repairProgress.create({
                repairRequestId: id,
                repairById: entity.repairById,
                status: REPAIR_REQUEST_STATUS.COMPLETED,
                trackingDate: new Date(),
            }),
        );
        return this.database.repairRequest.update(id, { status: REPAIR_REQUEST_STATUS.COMPLETED, endDate: new Date() });
    }

    /**
     * The function checks if a given repair request status is valid.
     * @param {number} id - The `id` parameter is the unique identifier of a repair request. It is used
     * to find the repair request in the database.
     * @param {string[]} statuses - An array of valid statuses for a repair request.
     * @returns the repairRequest object.
     */
    private async isStatusValid(data: { id: number; statuses: string[] }) {
        const repairRequest = await this.database.repairRequest.findOneBy({ id: data.id });
        if (!repairRequest) throw new HttpException('Không tìm thấy phiếu sửa chữa', 404);
        if (!data.statuses.includes(repairRequest.status)) throw new HttpException('Trạng thái không hợp lệ', 400);
        return repairRequest;
    }
}