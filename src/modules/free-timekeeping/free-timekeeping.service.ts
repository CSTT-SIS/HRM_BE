import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateFreeTimekeepingDto } from './dto/create-free-timekeeping.dto';
import { UpdateFreeTimekeepingDto } from './dto/update-free-timekeeping.dto';
import { FilterDto } from '~/common/dtos/filter.dto';

@Injectable()
export class FreeTimekeepingService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createFreeTimekeepingDto: CreateFreeTimekeepingDto, files: Array<Express.Multer.File>, userId: number) {
        return this.database.freeTimekeeping.save(
            this.database.freeTimekeeping.create({
                ...createFreeTimekeepingDto,
                supportingDocuments: files.length !== 0 ? files.map((file) => file.filename).join(', ') : null,
                createdBy: userId,
            }),
        );
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.freeTimekeeping, queries);

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
        const builder = this.database.freeTimekeeping.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    update(id: number, updateFreeTimekeepingDto: UpdateFreeTimekeepingDto, files: Array<Express.Multer.File>, userId: number) {
        return this.database.freeTimekeeping.update(id, {
            ...updateFreeTimekeepingDto,
            supportingDocuments: files.length !== 0 ? files.map((file) => file.filename).join(', ') : null,
            updatedBy: userId,
        });
    }

    remove(id: number) {
        return this.database.freeTimekeeping.delete(id);
    }
}
