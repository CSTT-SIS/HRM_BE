/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ForgottenTimekeepingRequestEntity } from '~/database/typeorm/entities/forgottenTimekeepingRequest.entity';

@Injectable()
export class ForgottenTimekeepingRequestRepository extends Repository<ForgottenTimekeepingRequestEntity> {
    constructor(private dataSource: DataSource) {
        super(ForgottenTimekeepingRequestEntity, dataSource.createEntityManager());
    }
}
