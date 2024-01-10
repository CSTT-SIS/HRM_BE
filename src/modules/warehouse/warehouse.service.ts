import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { CreateWarehouseTypeDto } from '~/modules/warehouse/dto/create-warehouse-type.dto';
import { UpdateWarehouseTypeDto } from '~/modules/warehouse/dto/update-warehouse-type.dto';
import { UtilService } from '~/shared/services';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehouseService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    /* WAREHOUSE */
    async create(createWarehouseDto: CreateWarehouseDto) {
        if (!this.utilService.isEmpty(createWarehouseDto.typeId)) {
            const type = await this.database.warehouseType.countBy({ id: createWarehouseDto.typeId });
            if (!type) {
                throw new BadRequestException('Không tìm thấy loại kho');
            }
        }

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
        if (!this.utilService.isEmpty(updateWarehouseDto.typeId)) {
            const type = await this.database.warehouseType.countBy({ id: updateWarehouseDto.typeId });
            if (!type) {
                throw new BadRequestException('Không tìm thấy loại kho');
            }
        }

        return this.database.warehouse.update(id, updateWarehouseDto);
    }

    remove(id: number) {
        return this.database.warehouse.delete(id);
    }

    /* WAREHOUSE TYPE */
    createType(createWarehouseTypeDto: CreateWarehouseTypeDto) {
        return this.database.warehouseType.save(this.database.warehouseType.create(createWarehouseTypeDto));
    }

    async findAllType(queries: { page: number; perPage: number; search: string; sortBy: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.warehouseType, queries);

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

    findOneType(id: number) {
        return this.database.warehouseType.findOne({ where: { id } });
    }

    updateType(id: number, updateWarehouseTypeDto: UpdateWarehouseTypeDto) {
        return this.database.warehouseType.update(id, updateWarehouseTypeDto);
    }

    removeType(id: number) {
        this.database.warehouse.update({ typeId: id }, { typeId: null });
        return this.database.warehouseType.delete(id);
    }
}
