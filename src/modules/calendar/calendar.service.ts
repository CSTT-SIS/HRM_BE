import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { FilterDto } from '~/common/dtos/filter.dto';

@Injectable()
export class CalendarService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createCalendarDto: CreateCalendarDto, userId: number) {
        return this.database.calendar.save(this.database.calendar.create({ ...createCalendarDto, createdBy: userId }));
    }

    createByUserLogin(createCalendarDto: CreateCalendarDto, userId: number) {
        return this.database.calendar.save(this.database.calendar.create({ ...createCalendarDto, createdBy: userId }));
    }

    async findAll(queries: FilterDto & { departmentId: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.calendar, queries);

        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['departmentId']));
        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['content'], keyword: queries.search }));

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
        const builder = this.database.calendar.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    update(id: number, updateCalendarDto: UpdateCalendarDto, userId: number) {
        return this.database.calendar.update(id, { ...updateCalendarDto, updatedBy: userId });
    }

    remove(id: number) {
        return this.database.calendar.delete(id);
    }
}
