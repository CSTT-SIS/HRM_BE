import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { In, Not } from 'typeorm';
import { FilterDto } from '~/common/dtos/filter.dto';
import { PROPOSAL_STATUS, PROPOSAL_TYPE } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { CreateProposalDetailDto, CreateProposalDetailsDto } from '~/modules/proposal/dto/create-proposal-detail.dto';
import { UpdateProposalDetailDto } from '~/modules/proposal/dto/update-proposal-detail.dto';
import { ProposalEvent } from '~/modules/proposal/events/proposal.event';
import { UtilService } from '~/shared/services';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';

@Injectable()
export class ProposalService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    async create(createProposalDto: CreateProposalDto) {
        // 1-level approval for ALL type
        const proposal = await this.database.proposal.save(this.database.proposal.create({ ...createProposalDto, createdById: UserStorage.getId() }));
        this.emitEvent('proposal.created', { id: proposal.id });
        return proposal;
    }

    async findAll(queries: FilterDto & { type: PROPOSAL_TYPE; status: PROPOSAL_STATUS }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.proposal, queries);

        builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['type', 'status']));

        builder.leftJoinAndSelect('entity.department', 'department');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.select([
            'entity',
            'department.id',
            'department.name',
            'createdBy.id',
            'createdBy.fullName',
            'cbDepartment.id',
            'cbDepartment.name',
            'updatedBy.id',
            'updatedBy.fullName',
            'ubDepartment.id',
            'ubDepartment.name',
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
        const builder = this.database.proposal.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.department', 'department');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndSelect('entity.details', 'details');
        builder.leftJoinAndSelect('details.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');

        builder.where('entity.id = :id', { id });
        builder.select([
            'entity',
            'department.id',
            'department.name',
            'createdBy.id',
            'createdBy.fullName',
            'cbDepartment.id',
            'cbDepartment.name',
            'updatedBy.id',
            'updatedBy.fullName',
            'ubDepartment.id',
            'ubDepartment.name',
            'details.id',
            'details.productId',
            'details.quantity',
            'details.note',
            'product.id',
            'product.name',
            'unit.id',
            'unit.name',
        ]);

        return builder.getOne();
    }

    async update(id: number, updateProposalDto: UpdateProposalDto) {
        await this.isProposalStatusValid({ id, statuses: [PROPOSAL_STATUS.DRAFT], userId: UserStorage.getId() });
        if (!Object.keys(PROPOSAL_TYPE).includes(updateProposalDto.type)) throw new HttpException('Loại yêu cầu không hợp lệ', 400);
        return this.database.proposal.update(id, {
            ...updateProposalDto,
            updatedById: UserStorage.getId(),
            status: PROPOSAL_STATUS.DRAFT,
        });
    }

    async remove(id: number) {
        await this.isProposalStatusValid({
            id,
            statuses: [PROPOSAL_STATUS.DRAFT, PROPOSAL_STATUS.HEAD_REJECTED],
            userId: UserStorage.getId(),
        });
        await this.database.proposalDetail.delete({ proposalId: id });
        return this.database.proposal.delete(id);
    }

    async pending(id: number) {
        await this.updateStatus({
            id,
            from: PROPOSAL_STATUS.DRAFT,
            to: PROPOSAL_STATUS.PENDING,
            userId: UserStorage.getId(),
        });

        this.emitEvent('proposal.pending', { id });
        return { message: 'Đã trình yêu cầu', data: { id } };
    }

    // async approve(id: number) {
    //     // TODO: check if user have permission to approve
    //     // maybe use a table to store who can approve which proposal is created by who

    //     await this.updateStatus({
    //         id,
    //         from: PROPOSAL_STATUS.PENDING,
    //         to: PROPOSAL_STATUS.APPROVED,
    //     });

    //     // Notify user who can create warehousing bill
    //     // maybe use a table to store who can receive notification when a proposal is approved
    //     // or send notification to all users who have permission to create warehousing bill (fastest way)
    //     this.emitEvent('proposal.approved', { id });

    //     return { message: 'Đã duyệt yêu cầu', data: { id } };
    // }

    // async reject(id: number, comment: string) {
    //     // TODO: check if user have permission to reject

    //     await this.updateStatus({
    //         id,
    //         from: PROPOSAL_STATUS.PENDING,
    //         to: PROPOSAL_STATUS.REJECTED,
    //         comment,
    //     });

    //     // Notify creator of this proposal
    //     this.emitEvent('proposal.rejected', { id });

    //     return { message: 'Đã từ chối yêu cầu', data: { id } };
    // }

    // async return(id: number, comment: string) {
    //     // TODO: check if user have permission to return

    //     await this.updateStatus({
    //         id,
    //         from: PROPOSAL_STATUS.APPROVED,
    //         to: PROPOSAL_STATUS.DRAFT,
    //         comment,
    //         checkIfBillCreated: true,
    //     });

    //     // Notify creator of this proposal
    //     this.emitEvent('proposal.returned', { id });

    //     return { message: 'Đã trả lại yêu cầu', data: { id } };
    // }

    async headApprove(id: number) {
        await this.utilService.checkApprovalPermission({
            entity: 'proposal',
            approverId: UserStorage.getId(),
            toStatus: PROPOSAL_STATUS.HEAD_APPROVED,
        });
        await this.updateStatus({
            id,
            from: PROPOSAL_STATUS.PENDING,
            to: PROPOSAL_STATUS.HEAD_APPROVED,
        });

        this.emitEvent('proposal.headApproved', { id });
        return { message: 'Đã duyệt yêu cầu', data: { id } };
    }

    async headReject(id: number, comment: string) {
        await this.utilService.checkApprovalPermission({
            entity: 'proposal',
            approverId: UserStorage.getId(),
            toStatus: PROPOSAL_STATUS.HEAD_REJECTED,
        });
        await this.updateStatus({
            id,
            from: PROPOSAL_STATUS.PENDING,
            to: PROPOSAL_STATUS.HEAD_REJECTED,
            comment,
        });

        this.emitEvent('proposal.headRejected', { id });
        return { message: 'Đã từ chối yêu cầu', data: { id } };
    }

    // async managerApprove(id: number) {
    //     await this.updateStatus({
    //         id,
    //         from: PROPOSAL_STATUS.HEAD_APPROVED,
    //         to: PROPOSAL_STATUS.MANAGER_APPROVED,
    //     });

    //     this.emitEvent('proposal.managerApproved', { id });
    //     return { message: 'Đã duyệt yêu cầu', data: { id } };
    // }

    // async managerReject(id: number, comment: string) {
    //     await this.updateStatus({
    //         id,
    //         from: PROPOSAL_STATUS.HEAD_APPROVED,
    //         to: PROPOSAL_STATUS.MANAGER_REJECTED,
    //         comment,
    //     });

    //     this.emitEvent('proposal.managerRejected', { id });
    //     return { message: 'Đã từ chối yêu cầu', data: { id } };
    // }

    async getDetails(queries: FilterDto & { proposalId: number; productId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.proposalDetail, queries);
        builder.andWhere(this.utilService.fullTextSearch({ fields: ['product.name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.andWhere('entity.proposalId = :id', { id: queries.proposalId });
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

    async addDetail(id: number, detail: CreateProposalDetailDto) {
        const proposal = await this.isProposalStatusValid({ id, statuses: [PROPOSAL_STATUS.DRAFT] });
        if (proposal.type === PROPOSAL_TYPE.PURCHASE && (detail.price === null || detail.price === undefined)) {
            throw new HttpException('Giá sản phẩm không được để trống', 400);
        }
        await this.verifyDetail(id, detail);
        return this.database.proposalDetail.save(this.database.proposalDetail.create({ ...detail, proposalId: id }));
    }

    async addDetails(id: number, dto: CreateProposalDetailsDto) {
        const proposal = await this.isProposalStatusValid({ id, statuses: [PROPOSAL_STATUS.DRAFT] });
        if (proposal.type === PROPOSAL_TYPE.PURCHASE) {
            for (const detail of dto.details) {
                if (detail.price === null || detail.price === undefined) {
                    throw new HttpException('Giá sản phẩm không được để trống', 400);
                }
            }
        }
        await this.verifyDetails(id, dto.details);
        return this.database.proposalDetail.save(dto.details.map((detail) => ({ ...detail, proposalId: id })));
    }

    async updateDetail(id: number, detailId: number, detail: UpdateProposalDetailDto) {
        const proposal = await this.isProposalStatusValid({ id, statuses: [PROPOSAL_STATUS.DRAFT] });
        if (proposal.type === PROPOSAL_TYPE.PURCHASE && (detail.price === null || detail.price === undefined)) {
            throw new HttpException('Giá sản phẩm không được để trống', 400);
        }
        await this.verifyDetail(id, detail, detailId);
        return this.database.proposalDetail.update({ id: detailId, proposalId: id }, detail);
    }

    async removeDetail(id: number, detailId: number) {
        await this.isProposalStatusValid({ id, statuses: [PROPOSAL_STATUS.DRAFT] });
        await this.database.proposalDetail.delete({ id: detailId, proposalId: id });
        return { message: 'Đã xóa chi tiết', data: { id } };
    }

    /**
     * Check if user can update or delete proposal \
     * User must be the creator of the proposal and the status must be the same as the one in the statuses array
     * @param id proposal id
     * @param statuses array of valid statuses
     * @param userId (optional) creator id
     * @param checkIfBillCreated (optional) check if warehousing bill is created
     * @returns proposal entity
     */
    private async isProposalStatusValid(data: {
        id: number;
        statuses: any[];
        userId?: number;
        checkIfBillCreated?: boolean;
    }): Promise<ProposalEntity> {
        const entity = await this.database.proposal.findOneBy({ id: data.id });
        if (!entity) throw new HttpException('Không tìm thấy yêu cầu', 404);
        if (!data.statuses.includes(entity.status)) throw new HttpException('Không thể chỉnh sửa yêu cầu do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId) throw new HttpException('Bạn không có quyền chỉnh sửa yêu cầu này', 403);
        if (data.checkIfBillCreated) {
            const order = await this.database.order.isProposalAdded(data.id);
            if (order) throw new HttpException('Không thể chỉnh sửa yêu cầu do đơn hàng đã được tạo', 400);

            const bill = await this.database.warehousingBill.countBy({ proposalId: data.id });
            if (bill) throw new HttpException('Không thể chỉnh sửa yêu cầu do phiếu kho đã được tạo', 400);
        }

        // TODO:
        // 1-level approval for ALL type

        return entity;
    }

    private async verifyDetails(proposalId: number, details: { productId: number; quantity: number; note?: string }[]) {
        const productIds = details.map((detail) => detail.productId).filter((productId) => productId);
        const productQuantities = details.map((detail) => detail.quantity).filter((quantity) => quantity);
        if (productIds.length === 0) throw new HttpException('Sản phẩm không được để trống', 400);
        if (productQuantities.length === 0) throw new HttpException('Số lượng không được để trống', 400);
        if (productIds.length !== productQuantities.length) throw new HttpException('Số lượng sản phẩm không hợp lệ', 400);

        const products = await this.database.product.find({ select: ['id'], where: { id: In(productIds) } });
        const productIdsInDb = products.map((product) => product.id);
        const productIdsNotInDb = productIds.filter((productId) => !productIdsInDb.includes(productId));
        if (productIdsNotInDb.length > 0) throw new HttpException(`Sản phẩm ${productIdsNotInDb.join(', ')} không tồn tại`, 400);

        if (proposalId) {
            const isDuplicate = await this.database.proposalDetail.findOneBy({ proposalId, productId: In(productIds) });
            if (isDuplicate) throw new HttpException('Sản phẩm đã được thêm vào yêu cầu', 400);
        }
    }

    private async verifyDetail(proposalId: number, detail: { productId?: number; quantity?: number; note?: string }, detailId?: number) {
        if (detail?.productId) {
            const isDuplicate = await this.database.proposalDetail.findOneBy({
                proposalId,
                productId: detail.productId,
                id: detailId ? Not(detailId) : undefined,
            });
            if (isDuplicate) throw new HttpException('Sản phẩm đã được thêm vào yêu cầu', 400);
        }
    }

    private async updateStatus(data: {
        id: number;
        from: PROPOSAL_STATUS;
        to: PROPOSAL_STATUS;
        comment?: string;
        checkIfBillCreated?: boolean;
        userId?: number;
    }) {
        await this.isProposalStatusValid({ id: data.id, statuses: [data.from], checkIfBillCreated: data.checkIfBillCreated, userId: data.userId });
        await this.database.proposal.update(data.id, { status: data.to });
        await this.database.approvalProcess.save(
            this.database.approvalProcess.create({
                proposalId: data.id,
                userId: UserStorage.getId(),
                from: data.from,
                to: data.to,
                comment: data.comment,
            }),
        );
    }

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new ProposalEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }
}
