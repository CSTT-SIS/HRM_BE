/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { EmployeeLeaveRequestEntity } from '~/database/typeorm/entities/employeeLeaveRequest.entity';

@Injectable()
export class EmployeeLeaveRequestRepository extends Repository<EmployeeLeaveRequestEntity> {
    constructor(private dataSource: DataSource) {
        super(EmployeeLeaveRequestEntity, dataSource.createEntityManager());
    }
}
