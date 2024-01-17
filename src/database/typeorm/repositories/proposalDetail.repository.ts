/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProposalDetailEntity } from '~/database/typeorm/entities/proposalDetail.entity';

@Injectable()
export class ProposalDetailRepository extends Repository<ProposalDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(ProposalDetailEntity, dataSource.createEntityManager());
    }
}
