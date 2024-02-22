import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import { FilterDto } from '~/common/dtos/filter.dto';

@Injectable()
export class LetterService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createLetterDto: CreateLetterDto) {
        return this.database.employeeLeaveRequest.save(this.database.employeeLeaveRequest.create(createLetterDto));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.employeeLeaveRequest, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['type'], keyword: queries.search }));

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
        const builder = this.database.employeeLeaveRequest.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    update(id: number, updateLetterDto: UpdateLetterDto) {
        return this.database.employeeLeaveRequest.update(id, updateLetterDto);
    }

    remove(id: number) {
        return this.database.employeeLeaveRequest.delete(id);
    }
}
