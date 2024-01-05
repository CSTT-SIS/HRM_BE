/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProviderEntity } from '~/database/typeorm/entities/provider.entity';

@Injectable()
export class ProviderRepository extends Repository<ProviderEntity> {
    constructor(private dataSource: DataSource) {
        super(ProviderEntity, dataSource.createEntityManager());
    }
}
