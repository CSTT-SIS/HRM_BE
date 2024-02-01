import { Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import {
    ORDER_STATUS,
    ORDER_TYPE,
    ORDER_TYPE_NAME,
    PROPOSAL_STATUS,
    PROPOSAL_TYPE,
    PROPOSAL_TYPE_NAME,
    WAREHOUSING_BILL_TYPE,
    WAREHOUSING_BILL_TYPE_NAME,
} from '~/common/enums/enum';
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

    proposalType() {
        return Object.values(PROPOSAL_TYPE).map((item) => ({ value: item, label: PROPOSAL_TYPE_NAME[item] }));
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

    order(queries: FilterDto & { proposalId: string; providerId: string; status: ORDER_STATUS }) {
        return this.getDropdown({
            entity: 'order',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
            andWhere: this.utilService.getConditionsFromQuery(queries, ['proposalId', 'providerId', 'status']),
        });
    }

    orderType() {
        return Object.values(ORDER_TYPE).map((item) => ({ value: item, label: ORDER_TYPE_NAME[item] }));
    }

    warehousingBillType() {
        return Object.values(WAREHOUSING_BILL_TYPE).map((item) => ({ value: item, label: WAREHOUSING_BILL_TYPE_NAME[item] }));
    }

    user(queries: FilterDto & { fullName: string }) {
        return this.getDropdown({
            entity: 'user',
            queries,
            label: 'fullName',
            value: 'id',
            fulltext: true,
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
            builder.andWhere(this.utilService.fullTextSearch({ fields: [data.label], keyword: data.queries.search }));
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
