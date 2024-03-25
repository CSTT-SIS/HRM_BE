import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CALENDAR_TYPE } from '~/common/enums/enum';

@Injectable()
export class CalendarService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    async create(createCalendarDto: CreateCalendarDto, userId: number) {
        const calendar = await this.database.calendar.save(this.database.calendar.create({ ...createCalendarDto, createdBy: userId }));

        await this.database.calendarUser.save(
            this.database.calendarUser.create(
                createCalendarDto.userIds.map((item) => {
                    return {
                        userId: item,
                        calendarId: calendar.id,
                    };
                }),
            ),
        );

        return calendar;
    }

    async findAllByUserLogin(queries: FilterDto & { userId: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.calendar, queries);

        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['userId']));
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

    async findAll(queries: FilterDto & { type: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.calendar, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['title'], keyword: queries.search }));

        if (queries.type === CALENDAR_TYPE.BY_DAY) {
            builder.andWhere('DAY(entity.startDate) = DAY(CURRENT_DATE()) OR DAY(entity.endDate) = DAY(CURRENT_DATE())');
        } else if (queries.type === CALENDAR_TYPE.BY_WEEK) {
            builder.andWhere(
                'entity.startDate >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) OR entity.endDate >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)',
            );
        } else if (queries.type === CALENDAR_TYPE.BY_MONTH) {
            builder.andWhere('MONTH(entity.startDate) = MONTH(CURRENT_DATE()) OR MONTH(entity.endDate) = MONTH(CURRENT_DATE())');
        }

        builder.leftJoinAndSelect('entity.calendarUsers', 'calendarUser');
        builder.leftJoinAndSelect('calendarUser.user', 'user');
        builder.select(['entity', 'calendarUser', 'user.fullName']);

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
        builder.leftJoinAndSelect('entity.calendarUsers', 'calendarUser');
        builder.leftJoinAndSelect('calendarUser.user', 'user');
        builder.where({ id });
        builder.select(['entity', 'calendarUser', 'user.fullName']);
        return builder.getOne();
    }

    update(id: number, updateCalendarDto: UpdateCalendarDto, userId: number) {
        return this.database.calendar.update(id, { ...updateCalendarDto, updatedBy: userId });
    }

    remove(id: number) {
        return this.database.calendar.delete(id);
    }
}
