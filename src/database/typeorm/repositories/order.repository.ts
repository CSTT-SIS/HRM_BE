/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OrderEntity } from '~/database/typeorm/entities/order.entity';

@Injectable()
export class OrderRepository extends Repository<OrderEntity> {
    constructor(private dataSource: DataSource) {
        super(OrderEntity, dataSource.createEntityManager());
    }
}
