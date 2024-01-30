import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';

@Injectable()
export class DropdownService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    warehouseType(queries: { page: number; perPage: number; search: string; sortBy: string }) {
        return this.getDropdown({
            entity: 'warehouseType',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
        });
    }

    product(queries: { page: number; perPage: number; search: string; sortBy: string }) {
        return this.getDropdown({
            entity: 'product',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
        });
    }

    productCategory(queries: { page: number; perPage: number; search: string; sortBy: string }) {
        return this.getDropdown({
            entity: 'productCategory',
            queries,
            label: 'name',
            value: 'id',
            fulltext: false,
        });
    }

    unit(queries: { page: number; perPage: number; search: string; sortBy: string }) {
        return this.getDropdown({
            entity: 'unit',
            queries,
            label: 'name',
            value: 'id',
            fulltext: false,
        });
    }

    provider(queries: { page: number; perPage: number; search: string; sortBy: string }) {
        return this.getDropdown({
            entity: 'provider',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
        });
    }

    proposal(queries: { page: number; perPage: number; search: string; sortBy: string }) {
        return this.getDropdown({
            entity: 'proposal',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
        });
    }

    private async getDropdown(data: {
        entity: string;
        queries: { page: number; perPage: number; search: string; sortBy: string };
        label: string;
        value: string;
        fulltext?: boolean;
    }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database[data.entity], data.queries);
        builder.select([`entity.${data.value} as value`, `entity.${data.label} as label`]);
        builder.addSelect(`COUNT(entity.id) OVER() AS total`);

        if (data.queries.search && data.fulltext) {
            builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: data.queries.search }));
        }
        if (data.queries.search && !data.fulltext) {
            builder.andWhere(`entity.${data.label} ILIKE :search`, { search: `%${data.queries.search}%` });
        }

        const result = await builder.getRawMany();
        const total = Number(result?.[0]?.['total'] || 0);
        const totalPages = Math.ceil(total / take);

        return {
            data: result?.map((item) => ({ value: item.value, label: item.label })),
            pagination: {
                ...pagination,
                totalRecords: total,
                totalPages: totalPages,
            },
        };
    }
}
