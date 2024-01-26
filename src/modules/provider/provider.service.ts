import { Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProviderService {
    constructor(private readonly database: DatabaseService, private readonly utilService: UtilService) {}

    create(createProviderDto: CreateProviderDto) {
        return this.database.provider.save(this.database.provider.create(createProviderDto));
    }

    async findAll(queries: FilterDto & { test: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.provider, queries);

        if (!this.utilService.isEmpty(queries.search)) {
            builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));
        }

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
        return this.database.provider.findOne({ where: { id } });
    }

    update(id: number, updateProviderDto: UpdateProviderDto) {
        return this.database.provider.update(id, updateProviderDto);
    }

    remove(id: number) {
        return this.database.provider.delete(id);
    }
}
