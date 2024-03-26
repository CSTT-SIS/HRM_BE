import { Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateApprovalManagementDto } from './dto/create-approval-management.dto';
import { UpdateApprovalManagementDto } from './dto/update-approval-management.dto';

@Injectable()
export class ApprovalManagementService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    async create(createApprovalManagementDto: CreateApprovalManagementDto) {
        const config = await this.database.approvalConfig.getConfig(createApprovalManagementDto);
        if (config) {
            throw new Error('Người duyệt đã tồn tại');
        }

        return this.database.approvalConfig.save(this.database.approvalConfig.create(createApprovalManagementDto));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.approvalConfig, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
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
        const builder = this.database.approvalConfig.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    update(id: number, updateApprovalManagementDto: UpdateApprovalManagementDto) {
        return this.database.approvalConfig.update(id, updateApprovalManagementDto);
    }

    remove(id: number) {
        return this.database.approvalConfig.delete(id);
    }
}
