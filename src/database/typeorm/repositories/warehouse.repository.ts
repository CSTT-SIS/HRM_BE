/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';

@Injectable()
export class WarehouseRepository extends Repository<WarehouseEntity> {
    constructor(private dataSource: DataSource) {
        super(WarehouseEntity, dataSource.createEntityManager());
    }
}
