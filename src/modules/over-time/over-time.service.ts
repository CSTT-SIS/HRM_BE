import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateOverTimeDto } from './dto/create-over-time.dto';
import { UpdateOverTimeDto } from './dto/update-over-time.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { OVERTIME_REQUEST_STATUS } from '~/common/enums/enum';

@Injectable()
export class OverTimeService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createOverTimeDto: CreateOverTimeDto, files: Array<Express.Multer.File>, userId: number) {
        return this.database.overtimeRequest.save(
            this.database.overtimeRequest.create({
                ...createOverTimeDto,
                supportingDocuments: files.length !== 0 ? files.map((file) => file.filename).join(',') : null,
                createdBy: userId,
            }),
        );
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.overtimeRequest, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['reason'], keyword: queries.search }));

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
        const builder = this.database.overtimeRequest.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    async update(id: number, updateOverTimeDto: UpdateOverTimeDto, files: Array<Express.Multer.File>, userId: number) {
        const overTime = await this.database.overtimeRequest.findOneBy({ id });

        return this.database.overtimeRequest.update(id, {
            ...updateOverTimeDto,
            supportingDocuments: files.length !== 0 ? files.map((file) => file.filename).join(',') : null,
            approverId:
                overTime.status !== OVERTIME_REQUEST_STATUS.APPROVED && updateOverTimeDto.status === OVERTIME_REQUEST_STATUS.APPROVED
                    ? userId
                    : overTime.approverId,
            updatedBy: userId,
        });
    }

    remove(id: number) {
        return this.database.overtimeRequest.delete(id);
    }
}
