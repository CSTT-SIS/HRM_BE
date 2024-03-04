import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { FilterDto } from '~/common/dtos/filter.dto';

@Injectable()
export class HolidayService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createHolidayDto: CreateHolidayDto) {
        return this.database.holiday.save(this.database.holiday.create(createHolidayDto));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.holiday, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));

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
        const builder = this.database.holiday.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    update(id: number, updateHolidayDto: UpdateHolidayDto) {
        return this.database.holiday.update(id, updateHolidayDto);
    }

    remove(id: number) {
        return this.database.holiday.delete(id);
    }
}
