import { Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { PROPOSAL_STATUS, PROPOSAL_TYPE } from '~/common/enums/enum';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';

@Injectable()
export class DropdownService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    warehouseType(queries: FilterDto) {
        return this.getDropdown({
            entity: 'warehouseType',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
        });
    }

    product(queries: FilterDto & { categoryId: number }) {
        return this.getDropdown({
            entity: 'product',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
            andWhere: this.utilService.relationQuerySearch({ categoryId: queries.categoryId }),
        });
    }

    productCategory(queries: FilterDto) {
        return this.getDropdown({
            entity: 'productCategory',
            queries,
            label: 'name',
            value: 'id',
            fulltext: false,
        });
    }

    unit(queries: FilterDto) {
        return this.getDropdown({
            entity: 'unit',
            queries,
            label: 'name',
            value: 'id',
            fulltext: false,
        });
    }

    provider(queries: FilterDto) {
        return this.getDropdown({
            entity: 'provider',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
        });
    }

    proposal(queries: FilterDto & { type: PROPOSAL_TYPE; status: PROPOSAL_STATUS }) {
        return this.getDropdown({
            entity: 'proposal',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
            andWhere: this.utilService.getConditionsFromQuery(queries, ['type', 'status']),
        });
    }

    warehouse(queries: FilterDto & { typeId: number }) {
        return this.getDropdown({
            entity: 'warehouse',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
            andWhere: this.utilService.relationQuerySearch({ typeId: queries.typeId }),
        });
    }

    order(queries: FilterDto & { proposalId: number; providerId: number }) {
        return this.getDropdown({
            entity: 'order',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
            andWhere: this.utilService.getConditionsFromQuery(queries, ['proposalId', 'providerId']),
        });
    }

    private async getDropdown(data: {
        entity: string;
        queries: FilterDto;
        label: string;
        value: string;
        fulltext: boolean;
        andWhere?: string | string[] | object;
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
        if (data.andWhere) {
            builder.andWhere(data.andWhere);
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
