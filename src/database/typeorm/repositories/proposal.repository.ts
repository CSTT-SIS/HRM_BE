/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';

@Injectable()
export class ProposalRepository extends Repository<ProposalEntity> {
    constructor(private dataSource: DataSource) {
        super(ProposalEntity, dataSource.createEntityManager());
    }

    // addWarehouse(proposalId: number, warehouseId: number) {
    //     return this.query(`
    //         INSERT INTO proposals_warehouses (proposal_id, warehouse_id)
    //         VALUES (${proposalId}, ${warehouseId})
    //     `);
    // }

    // addWarehouses(proposalId: number, warehouseIds: number[]) {
    //     return this.query(`
    //         INSERT INTO proposals_warehouses (proposal_id, warehouse_id)
    //         VALUES ${warehouseIds.map((id) => `(${proposalId}, ${id})`).join(',')}
    //     `);
    // }

    // removeWarehouse(proposalId: number, warehouseId: number) {
    //     return this.query(`
    //         DELETE FROM proposals_warehouses
    //         WHERE proposal_id = ${proposalId} AND warehouse_id = ${warehouseId}
    //     `);
    // }

    // removeWarehouses(proposalId: number) {
    //     return this.query(`
    //         DELETE FROM proposals_warehouses
    //         WHERE proposal_id = ${proposalId}
    //     `);
    // }
}
