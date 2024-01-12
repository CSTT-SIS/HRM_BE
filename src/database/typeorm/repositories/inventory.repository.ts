/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';

@Injectable()
export class InventoryRepository extends Repository<InventoryEntity> {
    constructor(private dataSource: DataSource) {
        super(InventoryEntity, dataSource.createEntityManager());
    }
}
