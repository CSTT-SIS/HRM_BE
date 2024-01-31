import { Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UpdateProductLimitDto } from '~/modules/product/dto/update-product-limit.dto';
import { UtilService } from '~/shared/services';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
    constructor(private readonly database: DatabaseService, private readonly utilService: UtilService) {}

    async create(createProductDto: CreateProductDto) {
        return this.database.product.save(this.database.product.create(createProductDto));
    }

    async findAll(queries: FilterDto & { categoryId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.product, queries);

        builder.andWhere(this.utilService.relationQuerySearch({ categoryId: queries.categoryId }));
        builder.andWhere(this.utilService.fullTextSearch({ fields: ['name', 'code'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.category', 'category');
        builder.leftJoinAndSelect('entity.unit', 'unit');
        builder.leftJoinAndSelect('entity.media', 'media');
        builder.select(['entity', 'category.id', 'category.name', 'media.id', 'media.path', 'unit.id', 'unit.name']);

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
        return this.database.product.findOne({ where: { id }, relations: ['category', 'media'] });
    }

    async update(id: number, updateProductDto: UpdateProductDto) {
        return this.database.product.update(id, updateProductDto);
    }

    async remove(id: number) {
        const count = await this.database.inventory.count({ where: { productId: id } });
        if (count) {
            throw new Error('Không thể xóa sản phẩm đã tồn tại trong kho');
        }

        return this.database.product.delete(id);
    }

    async updateLimit(id: number, data: UpdateProductLimitDto) {
        const limit = await this.database.quantityLimit.findOne({ where: { productId: id } });
        if (limit) {
            return this.database.quantityLimit.update(limit.id, { updatedById: UserStorage.getId(), ...data });
        } else {
            return this.database.quantityLimit.save(this.database.quantityLimit.create({ productId: id, createdById: UserStorage.getId(), ...data }));
        }
    }
}
