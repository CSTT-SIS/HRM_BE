import { HttpException, Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateProposalTypeDto } from './dto/create-proposal-type.dto';
import { UpdateProposalTypeDto } from './dto/update-proposal-type.dto';

@Injectable()
export class ProposalTypeService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createProposalTypeDto: CreateProposalTypeDto) {
        return this.database.proposalType.save(this.database.proposalType.create(createProposalTypeDto));
    }

    async findAll(queries: { page: number; perPage: number; search: string; sortBy: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.proposalType, queries);

        if (!this.utilService.isEmpty(queries.search))
            builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));

        builder.select(['entity']);

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
        return this.database.proposalType.findOne({ where: { id }, relations: ['proposals'] });
    }

    update(id: number, updateProposalTypeDto: UpdateProposalTypeDto) {
        return this.database.proposalType.update(id, updateProposalTypeDto);
    }

    async remove(id: number) {
        const count = await this.database.proposal.countBy({ typeId: id });
        if (count > 0) throw new HttpException('Loại phiếu đề nghị đã được sử dụng', 400);

        return this.database.proposalType.delete(id);
    }
}
