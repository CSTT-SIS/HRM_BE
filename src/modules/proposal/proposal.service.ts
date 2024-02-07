import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { In } from 'typeorm';
import { FilterDto } from '~/common/dtos/filter.dto';
import { PROPOSAL_STATUS, PROPOSAL_TYPE } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { CreateProposalDetailDto } from '~/modules/proposal/dto/create-proposal-detail.dto';
import { UpdateProposalDetailDto } from '~/modules/proposal/dto/update-proposal-detail.dto';
import { ProposalEvent } from '~/modules/proposal/events/proposal.event';
import { UtilService } from '~/shared/services';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';

@Injectable()
export class ProposalService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    async create(createProposalDto: CreateProposalDto) {
        if (!Object.keys(PROPOSAL_TYPE).includes(createProposalDto.type)) throw new HttpException('Loại đề xuất không hợp lệ', 400);
        if (createProposalDto.type === PROPOSAL_TYPE.REPAIR) {
            return this.repairFlow(createProposalDto);
        }

        return this.database.proposal.save(this.database.proposal.create({ ...createProposalDto, createdById: UserStorage.getId() }));
    }

    async findAll(queries: FilterDto & { type: PROPOSAL_TYPE; status: PROPOSAL_STATUS }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.proposal, queries);

        builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['type', 'status']));

        builder.leftJoinAndSelect('entity.repairRequest', 'repairRequest');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.select([
            'entity',
            'repairRequest.id',
            'repairRequest.name',
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
        const builder = this.database.proposal.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.repairRequest', 'repairRequest');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('entity.details', 'details');
        builder.innerJoinAndSelect('details.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');

        builder.where('entity.id = :id', { id });
        builder.select([
            'entity',
            'repairRequest.id',
            'repairRequest.name',
            'createdBy.id',
            'createdBy.fullName',
            'updatedBy.id',
            'updatedBy.fullName',
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
        if (!Object.keys(PROPOSAL_TYPE).includes(updateProposalDto.type)) throw new HttpException('Loại đề xuất không hợp lệ', 400);
        return this.database.proposal.update(id, {
            ...updateProposalDto,
            updatedById: UserStorage.getId(),
            status: PROPOSAL_STATUS.DRAFT,
        });
    }

    async remove(id: number) {
        await this.isProposalStatusValid({ id, statuses: [PROPOSAL_STATUS.DRAFT, PROPOSAL_STATUS.REJECTED], userId: UserStorage.getId() });
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

        // Notify user who can approve this proposal
        this.emitEvent('proposal.pending', { id });

        return { message: 'Đã trình đề xuất', data: { id } };
    }

    async approve(id: number) {
        // TODO: check if user have permission to approve
        // maybe use a table to store who can approve which proposal is created by who

        await this.updateStatus({
            id,
            from: PROPOSAL_STATUS.PENDING,
            to: PROPOSAL_STATUS.APPROVED,
        });

        // Notify user who can create warehousing bill
        // maybe use a table to store who can receive notification when a proposal is approved
        // or send notification to all users who have permission to create warehousing bill (fastest way)
        this.emitEvent('proposal.approved', { id });

        return { message: 'Đã duyệt đề xuất', data: { id } };
    }

    async reject(id: number, comment: string) {
        // TODO: check if user have permission to reject

        await this.updateStatus({
            id,
            from: PROPOSAL_STATUS.PENDING,
            to: PROPOSAL_STATUS.REJECTED,
            comment,
        });

        // Notify creator of this proposal
        this.emitEvent('proposal.rejected', { id });

        return { message: 'Đã từ chối đề xuất', data: { id } };
    }

    async return(id: number, comment: string) {
        // TODO: check if user have permission to return

        await this.updateStatus({
            id,
            from: PROPOSAL_STATUS.APPROVED,
            to: PROPOSAL_STATUS.DRAFT,
            comment,
            checkIfBillCreated: true,
        });

        // Notify creator of this proposal
        this.emitEvent('proposal.returned', { id });

        return { message: 'Đã trả lại đề xuất', data: { id } };
    }

    async getDetails(queries: FilterDto & { proposalId: number; productId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.proposalDetail, queries);
        builder.andWhere(this.utilService.fullTextSearch({ fields: ['product.name'], keyword: queries.search }));

        builder.innerJoinAndSelect('entity.product', 'product');
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
        await this.verifyDetail(detail);
        return this.database.proposalDetail.save(this.database.proposalDetail.create({ ...detail, proposalId: id }));
    }

    async updateDetail(id: number, detailId: number, detail: UpdateProposalDetailDto) {
        const proposal = await this.isProposalStatusValid({ id, statuses: [PROPOSAL_STATUS.DRAFT] });
        if (proposal.type === PROPOSAL_TYPE.PURCHASE && (detail.price === null || detail.price === undefined)) {
            throw new HttpException('Giá sản phẩm không được để trống', 400);
        }
        await this.verifyDetail(detail);
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
        if (!entity) throw new HttpException('Không tìm thấy đề xuất', 404);
        if (!data.statuses.includes(entity.status)) throw new HttpException('Không thể chỉnh sửa đề xuất do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId) throw new HttpException('Bạn không có quyền chỉnh sửa đề xuất này', 403);
        if (data.checkIfBillCreated) {
            const order = await this.database.order.countBy({ proposalId: data.id });
            if (order) throw new HttpException('Không thể chỉnh sửa đề xuất do đơn hàng đã được tạo', 400);

            const bill = await this.database.warehousingBill.countBy({ proposalId: data.id });
            if (bill) throw new HttpException('Không thể chỉnh sửa đề xuất do phiếu kho đã được tạo', 400);
        }
        return entity;
    }

    private async verifyDetails(details: { productId: number; quantity: number; note?: string }[]) {
        const productIds = details.map((detail) => detail.productId).filter((productId) => productId);
        const productQuantities = details.map((detail) => detail.quantity).filter((quantity) => quantity);
        if (productIds.length === 0) throw new HttpException('Sản phẩm không được để trống', 400);
        if (productQuantities.length === 0) throw new HttpException('Số lượng không được để trống', 400);
        if (productIds.length !== productQuantities.length) throw new HttpException('Số lượng sản phẩm không hợp lệ', 400);

        const products = await this.database.product.find({ select: ['id'], where: { id: In(productIds) } });
        const productIdsInDb = products.map((product) => product.id);
        const productIdsNotInDb = productIds.filter((productId) => !productIdsInDb.includes(productId));

        if (productIdsNotInDb.length > 0) throw new HttpException(`Sản phẩm ${productIdsNotInDb.join(', ')} không tồn tại`, 400);
    }

    private async verifyDetail(detail: { productId?: number; quantity?: number; note?: string }) {
        if (detail?.productId) {
            const product = await this.database.product.countBy({ id: detail.productId });
            if (!product) throw new HttpException(`Sản phẩm ${detail.productId} không tồn tại`, 400);
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

    private async repairFlow(createProposalDto: CreateProposalDto) {
        if (!createProposalDto.repairRequestId) throw new HttpException('Yêu cầu sửa chữa không được để trống', 400);

        const countProposal = await this.database.proposal.countBy({ repairRequestId: createProposalDto.repairRequestId });
        if (countProposal) throw new HttpException(`Yêu cầu sửa chữa ${createProposalDto.repairRequestId} đã được tạo đề xuất`, 400);

        const repairDetails = await this.database.repairDetail.find({
            where: { repairRequestId: createProposalDto.repairRequestId },
        });
        const details = repairDetails.map((detail) => ({
            productId: detail.replacementPartId,
            quantity: detail.quantity,
        }));

        await this.verifyDetails(details);
        const proposal = await this.database.proposal.save(this.database.proposal.create({ ...createProposalDto, createdById: UserStorage.getId() }));
        await this.database.proposalDetail.save(details.map((detail) => ({ ...detail, proposalId: proposal.id })));

        return proposal;
    }

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new ProposalEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }
}
