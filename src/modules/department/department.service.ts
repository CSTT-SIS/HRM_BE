import { Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { DepartmentRepository } from '~/database/typeorm/repositories/department.repository';
import { UserRepository } from '~/database/typeorm/repositories/user.repository';
import { UtilService } from '~/shared/services';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
    constructor(
        private readonly departmentRepository: DepartmentRepository,
        private readonly userRepository: UserRepository,
        private readonly utilService: UtilService,
    ) {}

    create(createDepartmentDto: CreateDepartmentDto) {
        return this.departmentRepository.save(this.departmentRepository.create(createDepartmentDto));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.departmentRepository, queries);

        if (!this.utilService.isEmpty(queries.search)) {
            builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));
        }

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
        return this.departmentRepository.findOneBy({ id });
    }

    update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
        return this.departmentRepository.update(id, updateDepartmentDto);
    }

    remove(id: number) {
        // set null for all user in this department
        this.userRepository.update({ departmentId: id }, { departmentId: null });
        return this.departmentRepository.delete(id);
    }
}
