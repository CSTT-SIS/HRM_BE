/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OvertimeRequestEntity } from '~/database/typeorm/entities/overtimeRequest.entity';

@Injectable()
export class OvertimeRequestRepository extends Repository<OvertimeRequestEntity> {
    constructor(private dataSource: DataSource) {
        super(OvertimeRequestEntity, dataSource.createEntityManager());
    }
}
