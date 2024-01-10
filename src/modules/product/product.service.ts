import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
    constructor(private readonly database: DatabaseService, private readonly utilService: UtilService) {}

    async create(createProductDto: CreateProductDto) {
        if (!this.utilService.isEmpty(createProductDto.categoryId)) {
            const category = await this.database.productCategory.countBy({ id: createProductDto.categoryId });
            if (!category) {
                throw new BadRequestException('Không tìm thấy danh mục sản phẩm');
            }
        }

        if (!this.utilService.isEmpty(createProductDto.providerId)) {
            const provider = await this.database.provider.countBy({ id: createProductDto.providerId });
            if (!provider) {
                throw new BadRequestException('Không tìm thấy nhà cung cấp');
            }
        }

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
        if (!this.utilService.isEmpty(updateProductDto.categoryId)) {
            const category = await this.database.productCategory.countBy({ id: updateProductDto.categoryId });
            if (!category) {
                throw new BadRequestException('Không tìm thấy danh mục sản phẩm');
            }
        }

        if (!this.utilService.isEmpty(updateProductDto.providerId)) {
            const provider = await this.database.provider.countBy({ id: updateProductDto.providerId });
            if (!provider) {
                throw new BadRequestException('Không tìm thấy nhà cung cấp');
            }
        }

        return this.database.product.update(id, updateProductDto);
    }

    remove(id: number) {
        return this.database.product.delete(id);
    }
}
