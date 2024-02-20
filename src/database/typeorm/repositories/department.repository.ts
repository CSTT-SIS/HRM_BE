import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DepartmentEntity } from '~/database/typeorm/entities/department.entity';

@Injectable()
export class DepartmentRepository extends Repository<DepartmentEntity> {
    constructor(private dataSource: DataSource) {
        super(DepartmentEntity, dataSource.createEntityManager());
    }

    findOneDepartmentWithAllRelationsById = (id: number) => {
        return this.findOne({
            where: { id: id },
            relations: [
                'avatar',
                'staffs',
                'headOfDepartment',
                'parent',
                'children',
                'calendars',
                'departmentTasks',
                'assets',
                'documents',
                'sendDocuments',
                'textEmbryos',
            ],
        });
    };
}
