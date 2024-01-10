/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';

@Injectable()
export class ProductRepository extends Repository<ProductEntity> {
    constructor(private dataSource: DataSource) {
        super(ProductEntity, dataSource.createEntityManager());
    }
}
