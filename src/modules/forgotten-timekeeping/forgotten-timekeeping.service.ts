import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateForgottenTimekeepingDto } from './dto/create-forgotten-timekeeping.dto';
import { UpdateForgottenTimekeepingDto } from './dto/update-forgotten-timekeeping.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { FORGOTTEN_TIMEKEEPING_REQUEST_STATUS } from '~/common/enums/enum';

@Injectable()
export class ForgottenTimekeepingService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createForgottenTimekeepingDto: CreateForgottenTimekeepingDto, files: Array<Express.Multer.File>, userId: number) {
        return this.database.forgottentimekeepingRequest.save(
            this.database.forgottentimekeepingRequest.create({
                ...createForgottenTimekeepingDto,
                ...(files.length !== 0 && { supportingDocuments: files.map((file) => file.filename).join(',') }),
                createdBy: userId,
            }),
        );
    }

    async findAll(queries: FilterDto & { departmentId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.forgottentimekeepingRequest, queries);

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
        const builder = this.database.forgottentimekeepingRequest.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    async update(id: number, updateForgottenTimekeepingDto: UpdateForgottenTimekeepingDto, files: Array<Express.Multer.File>, userId: number) {
        const forgottentimekeepingRequest = await this.database.forgottentimekeepingRequest.findOneBy({ id });
        const approverData: any = {};

        if (
            forgottentimekeepingRequest.status !== FORGOTTEN_TIMEKEEPING_REQUEST_STATUS.APPROVED &&
            updateForgottenTimekeepingDto.status === FORGOTTEN_TIMEKEEPING_REQUEST_STATUS.APPROVED
        ) {
            approverData.approverId = userId;
            approverData.approverDate = new Date();
        }

        return this.database.forgottentimekeepingRequest.update(id, {
            ...updateForgottenTimekeepingDto,
            ...approverData,
            ...(files.length !== 0 && { supportingDocuments: files.map((file) => file.filename).join(',') }),
            updatedBy: userId,
        });
    }

    remove(id: number) {
        return this.database.forgottentimekeepingRequest.delete(id);
    }
}
