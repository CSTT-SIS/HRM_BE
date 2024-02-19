import { Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
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
        const entity = await this.database.warehouse.save(this.database.warehouse.create(createWarehouseDto));
        this.database.warehouse.update(entity.id, { parentPath: entity.id.toString() });

        return { result: true, message: 'Tạo kho thành công', data: entity };
    }

    async findAll(queries: FilterDto & { typeId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.warehouse, queries);

        builder.andWhere(this.utilService.relationQuerySearch({ typeId: queries.typeId }));
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
        return this.database.warehouse.update(id, updateWarehouseDto);
    }

    remove(id: number) {
        return this.database.warehouse.delete(id);
    }

    async getProducts(queries: FilterDto & { warehouseId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.inventory, queries);

        builder.andWhere(this.utilService.relationQuerySearch({ warehouseId: queries.warehouseId }));
        builder.andWhere(this.utilService.fullTextSearch({ entityAlias: 'product', fields: ['name', 'code'], keyword: queries.search }));
        builder.innerJoinAndSelect('entity.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.leftJoinAndSelect('product.category', 'category');
        builder.leftJoinAndSelect('product.quantityLimit', 'limit');
        builder.select([
            'entity',
            'product.id',
            'product.name',
            'product.code',
            'unit.id',
            'unit.name',
            'category.id',
            'category.name',
            'limit.id',
            'limit.minQuantity',
            'limit.maxQuantity',
        ]);

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
        await this.utilService.checkRelationIdExist({ warehouse: id });

        let inventory = await this.database.inventory.findOne({ where: { warehouseId: id, productId: data.productId } });
        if (inventory) {
            this.database.inventory.update(inventory.id, {
                quantity: inventory.quantity + data.quantity,
            });
            this.database.inventoryHistory.save(
                this.database.inventoryHistory.create({
                    inventoryId: inventory.id,
                    from: inventory.quantity,
                    to: inventory.quantity + data.quantity,
                    change: data.quantity,
                    updatedById: UserStorage.getId(),
                    type: INVENTORY_HISTORY_TYPE.IMPORT,
                }),
            );
        } else {
            inventory = await this.database.inventory.save(
                this.database.inventory.create({
                    ...data,
                    warehouseId: id,
                    createdById: UserStorage.getId(),
                }),
            );
            this.database.inventoryHistory.save(
                this.database.inventoryHistory.create({
                    inventoryId: inventory.id,
                    from: 0,
                    to: data.quantity,
                    change: data.quantity,
                    updatedById: UserStorage.getId(),
                    type: INVENTORY_HISTORY_TYPE.IMPORT,
                }),
            );
        }

        return inventory;
    }
}
