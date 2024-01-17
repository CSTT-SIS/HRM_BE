/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';

@Injectable()
export class ProposalRepository extends Repository<ProposalEntity> {
    constructor(private dataSource: DataSource) {
        super(ProposalEntity, dataSource.createEntityManager());
    }
}
