import { Injectable } from '@nestjs/common';
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
        await this.utilService.checkRelationIdExist({ productCategory: createProductDto.categoryId, provider: createProductDto.providerId });
        return this.database.product.save(this.database.product.create(createProductDto));
    }

    async findAll(queries: { page: number; perPage: number; search: string; sortBy: string; categoryId: number; providerId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.product, queries);

        builder.andWhere(this.utilService.relationQuerySearch({ categoryId: queries.categoryId, providerId: queries.providerId }));
        if (!this.utilService.isEmpty(queries.search)) {
            builder.andWhere(this.utilService.fullTextSearch({ fields: ['name', 'code'], keyword: queries.search }));
        }

        builder.leftJoinAndSelect('entity.category', 'category');
        builder.leftJoinAndSelect('entity.provider', 'provider');
        builder.leftJoinAndSelect('entity.media', 'media');
        builder.select(['entity', 'category.id', 'category.name', 'media.id', 'media.path', 'provider.id', 'provider.name']);

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
        await this.utilService.checkRelationIdExist({ productCategory: updateProductDto.categoryId, provider: updateProductDto.providerId });
        return this.database.product.update(id, updateProductDto);
    }

    remove(id: number) {
        return this.database.product.delete(id);
    }

    async updateLimit(id: number, data: UpdateProductLimitDto) {
        const limit = await this.database.quantityLimit.findOne({ where: { productId: id } });
        if (limit) {
            return this.database.quantityLimit.update(limit.id, { updatedById: UserStorage.get()?.id, ...data });
        } else {
            return this.database.quantityLimit.save(
                this.database.quantityLimit.create({ productId: id, createdById: UserStorage.get()?.id, ...data }),
            );
        }
    }
}
