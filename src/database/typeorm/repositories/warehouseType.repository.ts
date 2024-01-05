/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { WarehouseTypeEntity } from '~/database/typeorm/entities/warehouseType.entity';

@Injectable()
export class WarehouseTypeRepository extends Repository<WarehouseTypeEntity> {
    constructor(private dataSource: DataSource) {
        super(WarehouseTypeEntity, dataSource.createEntityManager());
    }
}
