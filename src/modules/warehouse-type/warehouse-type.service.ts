import { Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateWarehouseTypeDto } from './dto/create-warehouse-type.dto';
import { UpdateWarehouseTypeDto } from './dto/update-warehouse-type.dto';

@Injectable()
export class WarehouseTypeService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createWarehouseTypeDto: CreateWarehouseTypeDto) {
        return this.database.warehouseType.save(this.database.warehouseType.create(createWarehouseTypeDto));
    }

    async findAll(queries: FilterDto) {
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

    findOne(id: number) {
        return this.database.warehouseType.findOne({ where: { id } });
    }

    update(id: number, updateWarehouseTypeDto: UpdateWarehouseTypeDto) {
        return this.database.warehouseType.update(id, updateWarehouseTypeDto);
    }

    remove(id: number) {
        this.database.warehouse.update({ typeId: id }, { typeId: null });
        return this.database.warehouseType.delete(id);
    }
}
