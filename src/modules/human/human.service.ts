import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateHumanDto } from './dto/create-human.dto';
import { UpdateHumanDto } from './dto/update-human.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { HUMAN_DASHBOARD_TYPE } from '~/common/enums/enum';

@Injectable()
export class HumanService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(file: Express.Multer.File, createHumanDto: CreateHumanDto) {
        return this.database.staff.save(this.database.staff.create({ ...createHumanDto, avatar: file ? file.filename : '' }));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.staff, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));

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
        const builder = this.database.staff.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    update(id: number, file: Express.Multer.File, updateHumanDto: UpdateHumanDto) {
        return this.database.staff.update(id, { ...updateHumanDto, avatar: file ? file.filename : '' });
    }

    remove(id: number) {
        return this.database.staff.delete(id);
    }

    dashboard(type: string) {
        if (type === HUMAN_DASHBOARD_TYPE.SEX) {
            return this.database.staff.getStatisBySex();
        }

        if (type === HUMAN_DASHBOARD_TYPE.SENIORITY) {
            return this.database.staff.getStatisBySeniority();
        }

        if (type === HUMAN_DASHBOARD_TYPE.BY_MONTH) {
            return this.database.staff.getStatisByMonth();
        }

        throw new BadRequestException('Loại thống kê không hợp lệ!');
    }
}
