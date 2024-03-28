import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { FilterDto } from '~/common/dtos/filter.dto';

@Injectable()
export class PositionService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createPositionDto: CreatePositionDto) {
        return this.database.position.save(this.database.position.create(createPositionDto));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.position, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.contracts', 'contracts');

        builder.select(['entity', 'contracts']);

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
        return this.database.position.findOnePositiontWithAllRelationsById(id);
    }

    update(id: number, updatePositionDto: UpdatePositionDto) {
        return this.database.position.update(id, updatePositionDto);
    }

    remove(id: number) {
        return this.database.position.delete(id);
    }
}
