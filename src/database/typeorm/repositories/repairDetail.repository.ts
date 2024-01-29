/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RepairDetailEntity } from '~/database/typeorm/entities/repairDetail.entity';

@Injectable()
export class RepairDetailRepository extends Repository<RepairDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(RepairDetailEntity, dataSource.createEntityManager());
    }
}
