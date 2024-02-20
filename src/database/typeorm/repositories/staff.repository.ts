/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { StaffEntity } from '~/database/typeorm/entities/staff.entity';

@Injectable()
export class StaffRepository extends Repository<StaffEntity> {
    constructor(private dataSource: DataSource) {
        super(StaffEntity, dataSource.createEntityManager());
    }
}
