import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterDto } from '~/common/dtos/filter.dto';

@Injectable()
export class TaskService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createTaskDto: CreateTaskDto, userId: number) {
        return this.database.task.save(this.database.task.create({ ...createTaskDto, createdBy: userId }));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.task, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));

        builder.select(['entity']);

        const [result, total] = await builder.getManyAndCount();
        const totalPages = Math.ceil(total / take);
        return {
            data: result,
            pagination: {
                ...pagination,
                totalRecords: total,
                totalPages: totalPages,
            },
        };
    }

    findOne(id: number) {
        const builder = this.database.task.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
        return this.database.task.update(id, { ...updateTaskDto, updatedBy: userId });
    }

    remove(id: number) {
        return this.database.task.delete(id);
    }
}
