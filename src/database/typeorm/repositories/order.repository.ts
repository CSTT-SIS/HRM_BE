/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OrderEntity } from '~/database/typeorm/entities/order.entity';

@Injectable()
export class OrderRepository extends Repository<OrderEntity> {
    constructor(private dataSource: DataSource) {
        super(OrderEntity, dataSource.createEntityManager());
    }

    async isProductAddedToProposal(orderId: number, productId: number): Promise<boolean> {
        const result = await this.query(`
            SELECT COUNT(pd.id) as count
            FROM proposal_details as pd, orders as o
            WHERE pd.proposal_id = o.proposal_id
                AND pd.product_id = ${productId}
                AND o.id = ${orderId}
        `);

        return !!Number(result[0].count);
    }
}
