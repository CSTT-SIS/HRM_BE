/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OrderItemEntity } from '~/database/typeorm/entities/orderItem.entity';

@Injectable()
export class OrderItemRepository extends Repository<OrderItemEntity> {
    constructor(private dataSource: DataSource) {
        super(OrderItemEntity, dataSource.createEntityManager());
    }
}
