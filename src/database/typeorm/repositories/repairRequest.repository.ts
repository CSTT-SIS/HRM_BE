/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RepairRequestEntity } from '~/database/typeorm/entities/repairRequest.entity';

@Injectable()
export class RepairRequestRepository extends Repository<RepairRequestEntity> {
    constructor(private dataSource: DataSource) {
        super(RepairRequestEntity, dataSource.createEntityManager());
    }
}
