import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '~/database/typeorm/repositories/permission.repository';
import { UtilService } from '~/shared/services';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
    constructor(private readonly permissionRespository: PermissionRepository, private readonly utilService: UtilService) {}

    create(createPermissionDto: CreatePermissionDto) {
        return `This action creates a permission`;
    }

    async findAll(query: { page: number; perPage: number; sortBy: string; search: number }) {
        const { take, skip, pagination } = this.utilService.getPagination(query);
        const builder = this.permissionRespository.createQueryBuilder('entity');
        builder.orderBy({ 'entity.name': 'ASC' });

        if (Number(query.perPage) !== 0) builder.take(take).skip(skip);
        if (query.sortBy) builder.orderBy(this.utilService.getSortCondition('entity', query.sortBy));
        if (query.search) builder.andWhere('entity.name ILIKE :name', { name: `%${query.search}%` });

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
        return this.permissionRespository.findOneBy({ id });
    }

    update(id: number, updatePermissionDto: UpdatePermissionDto) {
        return `This action updates a #${id} permission`;
    }

    remove(id: number) {
        return this.permissionRespository.delete(id);
    }
}
