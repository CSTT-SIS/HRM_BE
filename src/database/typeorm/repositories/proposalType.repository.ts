/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProposalTypeEntity } from '~/database/typeorm/entities/proposalType.entity';

@Injectable()
export class ProposalTypeRepository extends Repository<ProposalTypeEntity> {
    constructor(private dataSource: DataSource) {
        super(ProposalTypeEntity, dataSource.createEntityManager());
    }
}
