import { Injectable } from '@nestjs/common';
import { INVENTORY_HISTORY_TYPE } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { ImportGoodDto } from '~/modules/warehouse/dto/import-good.dto';
import { UtilService } from '~/shared/services';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehouseService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    async create(createWarehouseDto: CreateWarehouseDto) {
        await this.utilService.checkRelationIdExist({ warehouseType: createWarehouseDto.typeId });

        const entity = await this.database.warehouse.save(this.database.warehouse.create(createWarehouseDto));
        this.database.warehouse.update(entity.id, { parentPath: entity.id.toString() });

        return { result: true, message: 'Tạo kho thành công', data: entity };
    }

    async findAll(queries: { page: number; perPage: number; search: string; sortBy: string; typeId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.warehouse, queries);

        builder.andWhere(this.utilService.relationQuerySearch({ typeId: queries.typeId }));
        if (!this.utilService.isEmpty(queries.search))
            builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.type', 'type');
        builder.select(['entity', 'type.id', 'type.name']);

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
        return this.database.warehouse.findOne({ where: { id }, relations: ['type'] });
    }

    async update(id: number, updateWarehouseDto: UpdateWarehouseDto) {
        await this.utilService.checkRelationIdExist({ warehouseType: updateWarehouseDto.typeId });
        return this.database.warehouse.update(id, updateWarehouseDto);
    }

    remove(id: number) {
        return this.database.warehouse.delete(id);
    }

    async getProducts(queries: { page: number; perPage: number; search: string; sortBy: string; warehouseId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.inventory, queries);

        builder.andWhere(this.utilService.relationQuerySearch({ warehouseId: queries.warehouseId }));
        builder.leftJoinAndSelect('entity.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.leftJoinAndSelect('product.category', 'category');
        builder.leftJoinAndSelect('product.provider', 'provider');
        builder.leftJoinAndSelect('product.quantityLimit', 'limit');
        builder.select([
            'entity',
            'product.id',
            'product.name',
            'product.code',
            'product.price',
            'product.tax',
            'unit.id',
            'unit.name',
            'category.id',
            'category.name',
            'provider.id',
            'provider.name',
            'limit.id',
            'limit.minQuantity',
            'limit.maxQuantity',
        ]);

        if (!this.utilService.isEmpty(queries.search)) {
            builder.andWhere(this.utilService.fullTextSearch({ entityAlias: 'product', fields: ['name', 'code'], keyword: queries.search }));
        }

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

    async importGoods(id: number, data: ImportGoodDto) {
        await this.utilService.checkRelationIdExist({
            warehouse: id,
            product: data.productId,
        });

        const inventory = await this.database.inventory.save(
            this.database.inventory.create({
                ...data,
                warehouseId: id,
                createdById: UserStorage.get()?.id,
                note: INVENTORY_HISTORY_TYPE.IMPORT,
            }),
        );
        this.database.inventoryHistory.save(
            this.database.inventoryHistory.create({
                inventoryId: inventory.id,
                from: 0,
                to: data.quantity,
                change: data.quantity,
                updatedById: UserStorage.get()?.id,
                type: INVENTORY_HISTORY_TYPE.IMPORT,
                note: INVENTORY_HISTORY_TYPE.IMPORT,
            }),
        );

        return inventory;
    }
}
