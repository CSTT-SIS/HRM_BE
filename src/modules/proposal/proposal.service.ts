import { HttpException, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { PROPOSAL_STATUS } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
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
        const entity = await this.database.proposal.save(this.database.proposal.create({ ...rest, createdById: UserStorage.get()?.id }));
        await this.addDetails(entity.id, details);
        return entity;
    }

    async findAll(queries: { page: number; perPage: number; search: string; sortBy: string; typeId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.proposal, queries);

        if (!this.utilService.isEmpty(queries.search))
            builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.type', 'type');
        builder.leftJoinAndSelect('entity.warehouse', 'warehouse');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.select([
            'entity',
            'type.id',
            'type.name',
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
        const builder = this.database.proposal.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.type', 'type');
        builder.leftJoinAndSelect('entity.warehouse', 'warehouse');
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
            'warehouse.id',
            'warehouse.name',
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
        await this.canProposalBeModified(id);
        const { details, ...rest } = updateProposalDto;
        await this.utilService.checkRelationIdExist({ proposalType: updateProposalDto.typeId });
        await this.verifyDetails(details);
        await this.updateDetails(id, details);
        return this.database.proposal.update(id, rest);
    }

    async remove(id: number) {
        await this.canProposalBeModified(id);
        await this.database.proposalDetail.delete({ proposalId: id });
        return this.database.proposal.delete(id);
    }

    private async canProposalBeModified(id: number) {
        const entity = await this.database.proposal.findOneBy({ id });
        if (!entity) throw new HttpException('Không tìm thấy đề xuất', 404);
        if (![PROPOSAL_STATUS.PENDING, PROPOSAL_STATUS.REJECTED].includes(entity.status))
            throw new HttpException('Không thể chỉnh sửa đề xuất đã duyệt', 400);
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
