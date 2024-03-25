/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CalendarUserEntity } from '~/database/typeorm/entities/calendarUser.entity';

@Injectable()
export class CalendarUserRepository extends Repository<CalendarUserEntity> {
    constructor(private dataSource: DataSource) {
        super(CalendarUserEntity, dataSource.createEntityManager());
    }
}
