import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { EMPLOYEE_LEAVE_REQUEST_STATUS } from '~/common/enums/enum';

@Injectable()
export class LetterService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createLetterDto: CreateLetterDto, userId: number) {
        return this.database.employeeLeaveRequest.save(this.database.employeeLeaveRequest.create({ ...createLetterDto, createdBy: userId }));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.employeeLeaveRequest, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['reason'], keyword: queries.search }));

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

    async update(id: number, updateLetterDto: UpdateLetterDto, userId: number) {
        const employeeLeaveRequest = await this.database.employeeLeaveRequest.findOneBy({ id });
        const approverData: any = {};

        if (
            employeeLeaveRequest.status !== EMPLOYEE_LEAVE_REQUEST_STATUS.APPROVED &&
            updateLetterDto.status === EMPLOYEE_LEAVE_REQUEST_STATUS.APPROVED
        ) {
            approverData.approverId = userId;
            approverData.approverDate = new Date();
        }

        return this.database.employeeLeaveRequest.update(id, { ...updateLetterDto, ...approverData, updatedBy: userId });
    }

    remove(id: number) {
        return this.database.employeeLeaveRequest.delete(id);
    }
}
