import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateHumanDto } from './dto/create-human.dto';
import { UpdateHumanDto } from './dto/update-human.dto';
import { FilterDto } from '~/common/dtos/filter.dto';

@Injectable()
export class HumanService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createHumanDto: CreateHumanDto) {
        return this.database.staff.save(this.database.staff.create(createHumanDto));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.staff, queries);

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
        const builder = this.database.staff.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    update(id: number, updateHumanDto: UpdateHumanDto) {
        return this.database.staff.update(id, updateHumanDto);
    }

    remove(id: number) {
        return this.database.staff.delete(id);
    }
}
