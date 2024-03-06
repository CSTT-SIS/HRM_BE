/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PositionEntity } from '~/database/typeorm/entities/position.entity';

@Injectable()
export class PositionRepository extends Repository<PositionEntity> {
    constructor(private dataSource: DataSource) {
        super(PositionEntity, dataSource.createEntityManager());
    }

    findOnePositiontWithAllRelationsById = (id: number) => {
        return this.findOne({
            where: { id: id },
            relations: ['contracts'],
        });
    };
}
