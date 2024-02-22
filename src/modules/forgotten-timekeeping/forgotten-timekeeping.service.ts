import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateForgottenTimekeepingDto } from './dto/create-forgotten-timekeeping.dto';
import { UpdateForgottenTimekeepingDto } from './dto/update-forgotten-timekeeping.dto';
import { FilterDto } from '~/common/dtos/filter.dto';

@Injectable()
export class ForgottenTimekeepingService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createForgottenTimekeepingDto: CreateForgottenTimekeepingDto, files: Array<Express.Multer.File>) {
        return this.database.forgottentimekeepingrequest.save(
            this.database.forgottentimekeepingrequest.create({
                ...createForgottenTimekeepingDto,
                supportingDocuments: files ? files.map((file) => file.filename).join(', ') : '',
            }),
        );
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.forgottentimekeepingrequest, queries);

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
        const builder = this.database.forgottentimekeepingrequest.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    update(id: number, updateForgottenTimekeepingDto: UpdateForgottenTimekeepingDto, files: Array<Express.Multer.File>) {
        return this.database.forgottentimekeepingrequest.update(id, {
            ...updateForgottenTimekeepingDto,
            supportingDocuments: files ? files.map((file) => file.filename).join(', ') : '',
        });
    }

    remove(id: number) {
        return this.database.forgottentimekeepingrequest.delete(id);
    }
}
