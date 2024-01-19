/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProposalDetailEntity } from '~/database/typeorm/entities/proposalDetail.entity';

@Injectable()
export class ProposalDetailRepository extends Repository<ProposalDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(ProposalDetailEntity, dataSource.createEntityManager());
    }

    getDetailByProposalId(proposalId: number): Promise<{ id: number; productId: number; quantity: number }[]> {
        return this.createQueryBuilder('proposalDetail')
            .select('proposalDetail.productId', 'productId')
            .addSelect('proposalDetail.quantity', 'quantity')
            .where('proposalDetail.proposalId = :proposalId', { proposalId })
            .getRawMany();
    }
}
