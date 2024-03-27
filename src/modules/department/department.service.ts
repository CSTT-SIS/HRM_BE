import { HttpException, Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { DepartmentRepository } from '~/database/typeorm/repositories/department.repository';
import { UserRepository } from '~/database/typeorm/repositories/user.repository';
import { UtilService } from '~/shared/services';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DatabaseService } from '~/database/typeorm/database.service';
import { MediaService } from '~/modules/media/media.service';

@Injectable()
export class DepartmentService {
    constructor(
        private readonly departmentRepository: DepartmentRepository,
        private readonly userRepository: UserRepository,
        private readonly mediaService: MediaService,
        private readonly utilService: UtilService,
        private readonly database: DatabaseService,
    ) {}

    create(createDepartmentDto: CreateDepartmentDto) {
        return this.departmentRepository.save(this.departmentRepository.create(createDepartmentDto));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.departmentRepository, queries);

        if (!this.utilService.isEmpty(queries.search)) {
            builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));
        }

        builder.leftJoinAndSelect('entity.avatar', 'avatar');
        builder.leftJoinAndSelect('entity.users', 'users');
        builder.leftJoinAndSelect('entity.headOfDepartment', 'headOfDepartment');
        builder.leftJoinAndSelect('entity.parent', 'parent');
        builder.leftJoinAndSelect('entity.children', 'children');
        builder.leftJoinAndSelect('entity.departmentTasks', 'departmentTasks');
        builder.leftJoinAndSelect('entity.assets', 'assets');
        builder.leftJoinAndSelect('entity.documents', 'documents');
        builder.leftJoinAndSelect('entity.sendDocuments', 'sendDocuments');
        builder.leftJoinAndSelect('entity.textEmbryos', 'textEmbryos');

        builder.select([
            'entity',
            'avatar',
            'users',
            'headOfDepartment',
            'parent',
            'children',
            'departmentTasks',
            'assets',
            'documents',
            'sendDocuments',
            'textEmbryos',
        ]);

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

    private buildTree(departments: any[]): any[] {
        const tree = [];
        const map = {};

        for (const department of departments) {
            map[department.id] = department;
            department.children = []; // Khởi tạo mảng children trống cho mỗi phòng ban
        }

        for (const department of departments) {
            const parent = map[department.parentId];
            if (parent) {
                parent.children.push(department); // Thêm phòng ban vào mảng children của phòng ban cha
            } else {
                tree.push(department); // Nếu không có parentId thì đây là node gốc
            }
        }

        return tree;
    }

    async getListTypeTree(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.departmentRepository, queries);

        if (!this.utilService.isEmpty(queries.search)) {
            builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));
        }

        builder.leftJoinAndSelect('entity.avatar', 'avatar');
        builder.leftJoinAndSelect('entity.users', 'users');
        builder.leftJoinAndSelect('entity.headOfDepartment', 'headOfDepartment');
        builder.leftJoinAndSelect('entity.parent', 'parent');
        builder.leftJoinAndSelect('entity.children', 'children');
        builder.leftJoinAndSelect('entity.departmentTasks', 'departmentTasks');
        builder.leftJoinAndSelect('entity.assets', 'assets');
        builder.leftJoinAndSelect('entity.documents', 'documents');
        builder.leftJoinAndSelect('entity.sendDocuments', 'sendDocuments');
        builder.leftJoinAndSelect('entity.textEmbryos', 'textEmbryos');

        // builder.select([
        //     'entity',
        //     // 'avatar',
        //     // 'users',
        //     // 'headOfDepartment',
        //     'parent',
        //     'children',
        //     // 'departmentTasks',
        //     // 'assets',
        //     // 'documents',
        //     // 'sendDocuments',
        //     // 'textEmbryos',
        // ]);

        builder.orderBy('entity.parentId', 'ASC');

        builder.addSelect('CASE WHEN entity.parentId IS NULL THEN 0 ELSE 1 END', 'isRoot');

        const [result, total] = await builder.getManyAndCount();
        const totalPages = Math.ceil(total / take);
        return {
            data: this.buildTree(result),
            pagination: {
                ...pagination,
                totalRecords: total,
                totalPages: totalPages,
            },
        };
    }

    findOne(id: number) {
        return this.departmentRepository.findOneDepartmentWithAllRelationsById(id);
    }

    update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
        return this.departmentRepository.update(id, updateDepartmentDto);
    }

    async remove(id: number) {
        // set null for all user in this department
        const department = await this.database.department.findOneBy({ id });
        if (!department) {
            throw new HttpException('Không tìm thấy phòng ban', 404);
        }

        if (department.avatarId) {
            await this.mediaService.remove(department.avatarId);
        }

        return this.departmentRepository.delete(id);
    }
}
