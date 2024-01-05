import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DepartmentEntity } from '~/database/typeorm/entities/department.entity';

@Injectable()
export class DepartmentRepository extends Repository<DepartmentEntity> {
    constructor(private dataSource: DataSource) {
        super(DepartmentEntity, dataSource.createEntityManager());
    }
}
