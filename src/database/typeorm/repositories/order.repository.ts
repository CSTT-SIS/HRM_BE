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

    addProposals(orderId: number, proposalIds: number[]): Promise<any> {
        // Insert proposal that is not added to order
        return this.query(`
            INSERT INTO orders_proposals (order_id, proposal_id)
            SELECT ${orderId}, id FROM proposals WHERE id IN (${proposalIds.join(',')})
                AND id NOT IN (SELECT proposal_id FROM orders_proposals WHERE order_id = ${orderId})
        `);
    }

    removeProposals(orderId: number, proposalIds: number[]): Promise<any> {
        return this.query(`
            DELETE FROM orders_proposals WHERE order_id = ${orderId} AND proposal_id IN (${proposalIds.join(',')})
        `);
    }

    async isProposalAddedToOrder(orderId: number, proposalId: number): Promise<boolean> {
        const res = await this.query(`
            SELECT COUNT(id) as count FROM orders_proposals WHERE order_id = ${orderId} AND proposal_id = ${proposalId}
        `);

        return !!Number(res[0].count);
    }

    async isProposalAdded(proposalId: number): Promise<boolean> {
        const res = await this.query(`
            SELECT COUNT(id) as count FROM orders_proposals WHERE proposal_id = ${proposalId}
        `);

        return !!Number(res[0].count);
    }
}
