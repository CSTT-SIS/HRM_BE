/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CalendarEntity } from '~/database/typeorm/entities/calendar.entity';

@Injectable()
export class CalendarRepository extends Repository<CalendarEntity> {
    constructor(private dataSource: DataSource) {
        super(CalendarEntity, dataSource.createEntityManager());
    }
}
