import { HttpException, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { PROPOSAL_STATUS } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { UtilService } from '~/shared/services';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';

@Injectable()
export class ProposalService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    async create(createProposalDto: CreateProposalDto) {
        const { details, ...rest } = createProposalDto;
        await this.utilService.checkRelationIdExist({ proposalType: createProposalDto.typeId });
        await this.verifyDetails(details);
        const entity = await this.database.proposal.save(this.database.proposal.create({ ...rest, createdById: UserStorage.getId() }));
        await this.addDetails(entity.id, details);
        return entity;
    }

    async findAll(queries: { page: number; perPage: number; search: string; sortBy: string; typeId: number; status: PROPOSAL_STATUS }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.proposal, queries);

        if (!this.utilService.isEmpty(queries.search))
            builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['typeId', 'status']));

        builder.leftJoinAndSelect('entity.type', 'type');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.select(['entity', 'type.id', 'type.name', 'createdBy.id', 'createdBy.fullName', 'updatedBy.id', 'updatedBy.fullName']);

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
        builder.leftJoinAndSelect('entity.type', 'type');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('entity.details', 'details');
        builder.leftJoinAndSelect('details.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');

        builder.where('entity.id = :id', { id });
        builder.select([
            'entity',
            'type.id',
            'type.name',
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
        await this.isProposalStatusValid({ id, statuses: [PROPOSAL_STATUS.PENDING], userId: UserStorage.getId() });
        const { details, ...rest } = updateProposalDto;
        await this.utilService.checkRelationIdExist({ proposalType: updateProposalDto.typeId });
        await this.verifyDetails(details);
        await this.updateDetails(id, details);
        return this.database.proposal.update(id, {
            ...rest,
            updatedById: UserStorage.getId(),
            status: PROPOSAL_STATUS.PENDING,
        });
    }

    async remove(id: number) {
        await this.isProposalStatusValid({ id, statuses: [PROPOSAL_STATUS.PENDING, PROPOSAL_STATUS.REJECTED], userId: UserStorage.getId() });
        await this.database.proposalDetail.delete({ proposalId: id });
        return this.database.proposal.delete(id);
    }

    async approve(id: number) {
        // TODO: check if user have permission to approve
        // maybe use a table to store who can approve which proposal is created by who

        await this.isProposalStatusValid({ id, statuses: [PROPOSAL_STATUS.PENDING] });
        await this.database.proposal.update(id, { status: PROPOSAL_STATUS.APPROVED });
        await this.database.approvalProcess.save(
            this.database.approvalProcess.create({
                proposalId: id,
                userId: UserStorage.getId(),
                from: PROPOSAL_STATUS.PENDING,
                to: PROPOSAL_STATUS.APPROVED,
            }),
        );
        return { message: 'Đã duyệt đề xuất', data: { id } };
    }

    async reject(id: number) {
        // TODO: check if user have permission to reject

        await this.isProposalStatusValid({ id, statuses: [PROPOSAL_STATUS.PENDING] });
        await this.database.proposal.update(id, { status: PROPOSAL_STATUS.REJECTED });
        await this.database.approvalProcess.save(
            this.database.approvalProcess.create({
                proposalId: id,
                userId: UserStorage.getId(),
                from: PROPOSAL_STATUS.PENDING,
                to: PROPOSAL_STATUS.REJECTED,
            }),
        );
        return { message: 'Đã từ chối đề xuất', data: { id } };
    }

    async return(id: number) {
        // TODO: check if user have permission to return

        await this.isProposalStatusValid({ id, statuses: [PROPOSAL_STATUS.APPROVED], checkIfBillCreated: true });
        await this.database.proposal.update(id, { status: PROPOSAL_STATUS.PENDING });
        await this.database.approvalProcess.save(
            this.database.approvalProcess.create({
                proposalId: id,
                userId: UserStorage.getId(),
                from: PROPOSAL_STATUS.APPROVED,
                to: PROPOSAL_STATUS.PENDING,
            }),
        );
        return { message: 'Đã trả lại đề xuất', data: { id } };
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

    private async addDetails(proposalId: number, details: { productId: number; quantity: number; note?: string }[]) {
        const proposalDetails = details.map((detail) => ({
            ...detail,
            proposalId,
        }));

        await this.database.proposalDetail.save(this.database.proposalDetail.create(proposalDetails));
    }

    private async updateDetails(proposalId: number, details: { productId: number; quantity: number; note?: string }[]) {
        const detailsInDb = await this.database.proposalDetail.find({ where: { proposalId } });
        const productIdsInDb = detailsInDb.map((detail) => detail.productId);
        const productIds = details.map((detail) => detail.productId);
        const productIdsToDelete = productIdsInDb.filter((productId) => !productIds.includes(productId));
        const productIdsToAdd = productIds.filter((productId) => !productIdsInDb.includes(productId));
        const productIdsToUpdate = productIds.filter((productId) => productIdsInDb.includes(productId));
        const productIdsToUpdateDetails = detailsInDb.filter((detail) => productIdsToUpdate.includes(detail.productId));

        await Promise.all([
            this.database.proposalDetail.delete({ proposalId, productId: In(productIdsToDelete) }),
            this.addDetails(
                proposalId,
                details.filter((detail) => productIdsToAdd.includes(detail.productId)),
            ),
            productIdsToUpdateDetails.forEach((detail) => {
                this.database.proposalDetail.update(
                    detail.id,
                    details.find((d) => d.productId === detail.productId),
                );
            }),
        ]);
    }
}
