import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import moment from 'moment';
import { In, Not } from 'typeorm';
import { FilterDto } from '~/common/dtos/filter.dto';
import { REPAIR_REQUEST_STATUS } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { CreateRepairDetailDto, CreateRepairDetailsDto } from '~/modules/repair-request/dto/create-repair-detail.dto';
import { UpdateRepairDetailDto } from '~/modules/repair-request/dto/update-repair-detail.dto';
import { RepairRequestEvent } from '~/modules/repair-request/events/repair-request.event';
import { UtilService } from '~/shared/services';
import { CreateRepairRequestDto } from './dto/create-repair-request.dto';
import { UpdateRepairRequestDto } from './dto/update-repair-request.dto';

@Injectable()
export class RepairRequestService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    async create(createRepairRequestDto: CreateRepairRequestDto) {
        // with this request, need 1-level approval
        // can only create warehousing bill if status is HEAD_APPROVED
        const { vehicleRegistrationNumber, imageIds, ...rest } = createRepairRequestDto;
        const registrationNumber = vehicleRegistrationNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const vehicle = await this.database.vehicle.findOrCreate(registrationNumber);
        const entity = await this.database.repairRequest.save(
            this.database.repairRequest.create({
                ...rest,
                name: `[${registrationNumber}] ${moment().unix()}`,
                vehicleId: vehicle.id,
                startDate: new Date(),
                createdById: UserStorage.getId(),
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
        this.database.repairRequest.addImages(entity.id, imageIds);

        // notify to garage or head of department
        this.emitEvent('repairRequest.created', { id: entity.id });

        return entity;
    }

    async findAll(queries: FilterDto & { repairById: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.repairRequest, queries);

        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['repairById']));
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name', 'vehicle.registrationNumber'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.vehicle', 'vehicle');
        builder.leftJoinAndSelect('vehicle.user', 'vehicleUser');
        builder.leftJoinAndSelect('vehicleUser.department', 'vuDepartment');
        builder.leftJoinAndSelect('entity.repairBy', 'repairBy');
        builder.leftJoinAndSelect('repairBy.department', 'rbDepartment');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.select([
            'entity',
            'vehicle.id',
            'vehicle.registrationNumber',
            'vehicleUser.id',
            'vehicleUser.fullName',
            'vuDepartment.id',
            'vuDepartment.name',
            'repairBy.id',
            'repairBy.fullName',
            'rbDepartment.id',
            'rbDepartment.name',
            'createdBy.id',
            'createdBy.fullName',
            'cbDepartment.id',
            'cbDepartment.name',
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
        const builder = this.database.repairRequest.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.vehicle', 'vehicle');
        builder.leftJoinAndSelect('vehicle.user', 'vehicleUser');
        builder.leftJoinAndSelect('vehicleUser.department', 'vuDepartment');
        builder.leftJoinAndSelect('entity.details', 'details');
        builder.leftJoinAndSelect('details.replacementPart', 'replacementPart');
        builder.leftJoinAndSelect('entity.progresses', 'progresses');
        builder.leftJoinAndSelect('progresses.repairBy', 'progressRepairBy');
        builder.leftJoinAndSelect('entity.repairBy', 'repairBy');
        builder.leftJoinAndSelect('repairBy.department', 'rbDepartment');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');

        builder.select([
            'entity',
            'vehicle.id',
            'vehicle.registrationNumber',
            'vehicleUser.id',
            'vehicleUser.fullName',
            'vuDepartment.id',
            'vuDepartment.name',
            'details',
            'replacementPart.id',
            'replacementPart.name',
            'progresses',
            'progressRepairBy.id',
            'progressRepairBy.fullName',
            'repairBy.id',
            'repairBy.fullName',
            'rbDepartment.id',
            'rbDepartment.name',
            'createdBy.id',
            'createdBy.fullName',
            'cbDepartment.id',
            'cbDepartment.name',
        ]);

        builder.where({ id });
        return builder.getOne();
    }

    async update(id: number, updateRepairRequestDto: UpdateRepairRequestDto) {
        await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.IN_PROGRESS] });
        // TODO: check if warehousing bill was created by this repair request; if yes, throw error

        const { vehicleRegistrationNumber, imageIds, ...rest } = updateRepairRequestDto;
        const addUpdate = {};
        if (vehicleRegistrationNumber) {
            const registrationNumber = vehicleRegistrationNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            const vehicle = await this.database.vehicle.findOrCreate(registrationNumber);
            addUpdate['vehicleId'] = vehicle.id;
        }

        if (!this.utilService.isEmpty(imageIds)) {
            await this.database.repairRequest.removeAllImages(id);
            this.database.repairRequest.addImages(id, imageIds);
        }

        return this.database.repairRequest.update(id, { ...rest, ...addUpdate });
    }

    async remove(id: number) {
        await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.IN_PROGRESS, REPAIR_REQUEST_STATUS.HEAD_REJECTED] });
        this.database.repairDetail.delete({ repairRequestId: id });
        this.database.repairRequest.removeAllImages(id);
        this.database.repairProgress.delete({ repairRequestId: id });
        return this.database.repairRequest.delete(id);
    }

    async headApprove(id: number) {
        await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.IN_PROGRESS, REPAIR_REQUEST_STATUS.GARAGE_RECEIVED] });
        await this.utilService.checkApprovalPermission({
            entity: 'repairRequest',
            approverId: UserStorage.getId(),
            toStatus: REPAIR_REQUEST_STATUS.HEAD_APPROVED,
        });

        const entity = await this.database.repairRequest.findOneBy({ id });
        if (!entity) throw new HttpException('Không tìm thấy phiếu sửa chữa', 404);

        this.database.repairProgress.save(
            this.database.repairProgress.create({
                repairRequestId: id,
                repairById: entity.repairById,
                status: REPAIR_REQUEST_STATUS.HEAD_APPROVED,
                trackingDate: new Date(),
            }),
        );

        // notify who create warehousing bill
        this.emitEvent('repairRequest.headApprove', { id });
        return this.database.repairRequest.update(id, { status: REPAIR_REQUEST_STATUS.HEAD_APPROVED });
    }

    async headReject(id: number, comment: string) {
        await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.IN_PROGRESS, REPAIR_REQUEST_STATUS.GARAGE_RECEIVED] });
        await this.utilService.checkApprovalPermission({
            entity: 'repairRequest',
            approverId: UserStorage.getId(),
            toStatus: REPAIR_REQUEST_STATUS.HEAD_REJECTED,
        });

        const entity = await this.database.repairRequest.findOneBy({ id });
        if (!entity) throw new HttpException('Không tìm thấy phiếu sửa chữa', 404);

        this.database.repairProgress.save(
            this.database.repairProgress.create({
                repairRequestId: id,
                repairById: entity.repairById,
                status: REPAIR_REQUEST_STATUS.HEAD_REJECTED,
                trackingDate: new Date(),
            }),
        );

        // notify who create request
        this.emitEvent('repairRequest.headReject', { id });
        return this.database.repairRequest.update(id, { status: REPAIR_REQUEST_STATUS.HEAD_REJECTED });
    }

    async getDetails(queries: FilterDto & { requestId: number; replacementPartId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.repairDetail, queries);
        builder.andWhere(this.utilService.fullTextSearch({ fields: ['replacementPart.name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.replacementPart', 'replacementPart');
        builder.leftJoinAndSelect('replacementPart.unit', 'unit');
        builder.andWhere('entity.repairRequestId = :id', { id: queries.requestId });
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['replacementPartId']));
        builder.select(['entity', 'replacementPart.id', 'replacementPart.name', 'unit.id', 'unit.name']);

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
        await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.IN_PROGRESS] });
        await this.verifyDetail(id, data);
        return this.database.repairDetail.save(this.database.repairDetail.create({ ...data, repairRequestId: id }));
    }

    async addDetails(id: number, data: CreateRepairDetailsDto) {
        await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.IN_PROGRESS] });
        await this.verifyDetails(id, data.details);
        return this.database.repairDetail.save(data.details.map((item) => ({ ...item, repairRequestId: id })));
    }

    async updateDetail(id: number, detailId: number, data: UpdateRepairDetailDto) {
        await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.IN_PROGRESS] });
        await this.verifyDetail(id, data, detailId);
        return this.database.repairDetail.update({ id: detailId, repairRequestId: id }, data);
    }

    async removeDetail(id: number, detailId: number) {
        await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.IN_PROGRESS] });
        return this.database.repairDetail.delete({ id: detailId, repairRequestId: id });
    }

    // async inProgress(id: number) {
    //     await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.IN_PROGRESS] });
    //     const entity = await this.database.repairRequest.findOneBy({ id });
    //     if (!entity) throw new HttpException('Không tìm thấy phiếu sửa chữa', 404);

    //     this.database.repairProgress.save(
    //         this.database.repairProgress.create({
    //             repairRequestId: id,
    //             repairById: entity.repairById,
    //             status: REPAIR_REQUEST_STATUS.IN_PROGRESS,
    //             trackingDate: new Date(),
    //         }),
    //     );

    //     // notify who can complete request
    //     this.emitEvent('repairRequest.inProgress', { id });

    //     return this.database.repairRequest.update(id, { status: REPAIR_REQUEST_STATUS.IN_PROGRESS });
    // }

    // async complete(id: number) {
    //     await this.isStatusValid({ id, statuses: [REPAIR_REQUEST_STATUS.IN_PROGRESS] });
    //     const entity = await this.database.repairRequest.findOneBy({ id });
    //     if (!entity) throw new HttpException('Không tìm thấy phiếu sửa chữa', 404);

    //     this.database.repairProgress.save(
    //         this.database.repairProgress.create({
    //             repairRequestId: id,
    //             repairById: entity.repairById,
    //             status: REPAIR_REQUEST_STATUS.EXPORTED,
    //             trackingDate: new Date(),
    //         }),
    //     );

    //     // notify who created request
    //     this.emitEvent('repairRequest.completed', { id });

    //     return this.database.repairRequest.update(id, { status: REPAIR_REQUEST_STATUS.EXPORTED, endDate: new Date() });
    // }

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

    private async verifyDetails(
        requestId: number,
        details: { brokenPart?: string; description?: string; replacementPartId: number; quantity: number }[],
    ) {
        const replacementParts = await this.database.product.findBy({ id: In(details.map((item) => item.replacementPartId)) });
        if (replacementParts.length !== details.length) throw new HttpException('Linh kiện không tồn tại', 400);
        if (details.some((item) => item.quantity < 1)) throw new HttpException('Số lượng không hợp lệ', 400);

        const isDuplicate = await this.database.repairDetail.findOneBy({
            repairRequestId: requestId,
            replacementPartId: In(details.map((item) => item.replacementPartId)),
        });
        if (isDuplicate) throw new HttpException('Sản phẩm đã được thêm vào danh sách', 400);

        // CONSIDER: check if replacementPart in stock
    }

    private async verifyDetail(
        id: number,
        detail: { brokenPart?: string; description?: string; replacementPartId?: number; quantity?: number },
        detailId?: number,
    ) {
        const isDuplicate = await this.database.repairDetail.findOneBy({
            repairRequestId: id,
            replacementPartId: detail.replacementPartId,
            id: detailId ? Not(detailId) : undefined,
        });
        if (isDuplicate) throw new HttpException('Sản phẩm đã được thêm vào danh sách', 400);
    }

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new RepairRequestEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }
}
