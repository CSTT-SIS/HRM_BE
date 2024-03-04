/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { HolidayEntity } from '~/database/typeorm/entities/holiday.entity';

@Injectable()
export class HolidayRepository extends Repository<HolidayEntity> {
    constructor(private dataSource: DataSource) {
        super(HolidayEntity, dataSource.createEntityManager());
    }
}
