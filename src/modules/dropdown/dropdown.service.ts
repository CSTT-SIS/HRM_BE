import { Injectable } from '@nestjs/common';
import { In, Not } from 'typeorm';
import { FilterDto } from '~/common/dtos/filter.dto';
import {
    DAMAGE_LEVEL,
    DAMAGE_LEVEL_NAME,
    ORDER_STATUS,
    ORDER_TYPE,
    ORDER_TYPE_NAME,
    PROPOSAL_STATUS,
    PROPOSAL_TYPE,
    PROPOSAL_TYPE_NAME,
    REPAIR_REQUEST_STATUS,
    WAREHOUSING_BILL_TYPE,
    WAREHOUSING_BILL_TYPE_NAME,
} from '~/common/enums/enum';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';

@Injectable()
export class DropdownService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    product(queries: FilterDto & { categoryId: number; code: string; barcode: string }) {
        return this.getDropdown({
            entity: 'product',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
            andWhere: this.utilService.relationQuerySearch({ categoryId: queries.categoryId, code: queries.code, barcode: queries.barcode }),
            addSelect: ['code', 'barcode'],
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

    async proposal(
        queries: FilterDto & { type: PROPOSAL_TYPE; status: PROPOSAL_STATUS; isCreatedBill: boolean; isCreatedOrder: boolean; warehouseId: number },
    ) {
        // get order has not created warehousing bill
        let ids = queries.isCreatedBill
            ? (await this.database.warehousingBill.createQueryBuilder().select('proposal_id').getRawMany())
                  .map((item) => item.proposal_id)
                  .filter((item) => item)
            : [];
        ids = queries.isCreatedOrder ? [...ids, ...(await this.database.order.getProposalIds())] : ids;

        return this.getDropdown({
            entity: 'proposal',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
            andWhere: { ...this.utilService.getConditionsFromQuery(queries, ['type', 'status', 'warehouseId']), id: Not(In(ids)) },
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

    async order(queries: FilterDto & { proposalId: string; status: ORDER_STATUS; isCreatedBill: boolean }) {
        // get order has not created warehousing bill
        const ids = queries.isCreatedBill
            ? (await this.database.warehousingBill.createQueryBuilder().select('order_id').getRawMany())
                  .map((item) => item.order_id)
                  .filter((item) => item)
            : [];

        return this.getDropdown({
            entity: 'order',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
            andWhere: { ...this.utilService.getConditionsFromQuery(queries, ['proposalId', 'status']), id: Not(In(ids)) },
        });
    }

    orderType() {
        return Object.values(ORDER_TYPE).map((item) => ({ value: item, label: ORDER_TYPE_NAME[item] }));
    }

    warehousingBillType() {
        return [
            ...Object.values(WAREHOUSING_BILL_TYPE).map((item) => ({ value: item, label: WAREHOUSING_BILL_TYPE_NAME[item] })),
            {
                value: 'EXPORT',
                label: 'Phiếu xuất kho (mìn)',
            },
        ];
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

    async repairRequest(queries: FilterDto & { repairById: number; status: REPAIR_REQUEST_STATUS; isCreatedBill: boolean; isCreatedOrder: boolean }) {
        // get order has not created warehousing bill
        let ids = queries.isCreatedBill
            ? (await this.database.warehousingBill.createQueryBuilder().select('repair_request_id').getRawMany())
                  .map((item) => item.repair_request_id)
                  .filter((item) => item)
            : [];
        ids = queries.isCreatedOrder ? [...ids, ...(await this.database.order.getRepairRequestIds())] : ids;

        return this.getDropdown({
            entity: 'repairRequest',
            queries,
            label: 'name',
            value: 'id',
            fulltext: false,
            andWhere: { ...this.utilService.getConditionsFromQuery(queries, ['repairById', 'status']), id: Not(In(ids)) },
        });
    }

    vehicle(queries: FilterDto) {
        return this.getDropdown({
            entity: 'vehicle',
            queries,
            label: 'registrationNumber',
            value: 'id',
            fulltext: true,
        });
    }

    damageLevel() {
        return Object.values(DAMAGE_LEVEL).map((item) => ({ value: item, label: DAMAGE_LEVEL_NAME[item] }));
    }

    department(queries: FilterDto) {
        return this.getDropdown({
            entity: 'department',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
        });
    }

    inventory(queries: FilterDto & { warehouseId: number }) {
        return this.getDropdown({
            entity: 'inventory',
            queries,
            label: 'name',
            value: 'id',
            fulltext: true,
            andWhere: this.utilService.getConditionsFromQuery(queries, ['warehouseId']),
            relation: 'product',
            alias: 'product',
        });
    }

    private async getDropdown(data: {
        entity: string;
        queries: FilterDto;
        label: string;
        value: string;
        fulltext: boolean;
        andWhere?: string | string[] | object;
        relation?: string;
        alias?: string;
        addSelect?: string[];
    }) {
        const alias = data.alias || 'entity';
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database[data.entity], data.queries);
        builder.select([`${alias}.${data.value} as value`, `${alias}.${data.label} as label`]);
        builder.addSelect(`COUNT(entity.id) OVER() AS total`);

        if (data.queries.search && data.fulltext) {
            builder.andWhere(this.utilService.fullTextSearch({ fields: [data.label], keyword: data.queries.search, entityAlias: alias }));
        }
        if (data.queries.search && !data.fulltext) {
            builder.andWhere(`${alias}.${data.label} ILIKE :search`, { search: `%${data.queries.search}%` });
        }
        if (data.andWhere) {
            builder.andWhere(data.andWhere);
        }
        if (data.relation) {
            builder.leftJoinAndSelect(`entity.${data.relation}`, data.relation);
        }
        if (data.addSelect?.length) {
            data.addSelect.forEach((item) => {
                builder.addSelect(`${alias}.${item} as ${item}`);
            });
        }

        const result = await builder.getRawMany();
        const total = Number(result?.[0]?.['total'] || 0);
        const totalPages = Math.ceil(total / take);

        return {
            data: result?.map((item) => ({ ...item, value: item.value, label: item.label })),
            pagination: {
                ...pagination,
                totalRecords: total,
                totalPages: totalPages,
            },
        };
    }
}
