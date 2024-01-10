/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProductCategoryEntity } from '~/database/typeorm/entities/productCategory.entity';

@Injectable()
export class ProductCategoryRepository extends Repository<ProductCategoryEntity> {
    constructor(private dataSource: DataSource) {
        super(ProductCategoryEntity, dataSource.createEntityManager());
    }
}
