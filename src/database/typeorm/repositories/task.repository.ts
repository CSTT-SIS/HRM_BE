/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TaskEntity } from '~/database/typeorm/entities/task.entity';

@Injectable()
export class TaskRepository extends Repository<TaskEntity> {
    constructor(private dataSource: DataSource) {
        super(TaskEntity, dataSource.createEntityManager());
    }
}
