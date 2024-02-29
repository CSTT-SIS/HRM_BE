/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ContractEntity } from '~/database/typeorm/entities/contract.entity';

@Injectable()
export class ContractRepository extends Repository<ContractEntity> {
    constructor(private dataSource: DataSource) {
        super(ContractEntity, dataSource.createEntityManager());
    }
}
