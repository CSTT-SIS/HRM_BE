import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '~/database/typeorm/repositories/role.repository';
import { UtilService } from '~/shared/services';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
    constructor(private readonly roleRepository: RoleRepository, private readonly utilService: UtilService) {}

    async create(createRoleDto: CreateRoleDto) {
        const entity = this.roleRepository.create({
            name: createRoleDto.name,
            description: createRoleDto.description,
        });
        const result = await this.roleRepository.save(entity);

        // add permissions to role
        if (createRoleDto.permissionIds?.length) {
            this.roleRepository.createQueryBuilder().relation('permissions').of(result).add(createRoleDto.permissionIds);
        }

        return result;
    }

    async findAll(query: { page: number; perPage: number; sortBy: string; search: string }) {
        const { take, skip, pagination } = this.utilService.getPagination(query);
        const builder = this.roleRepository.createQueryBuilder('entity');

        if (Number(query.perPage) !== 0) builder.take(take).skip(skip);
        if (query.sortBy) builder.orderBy(this.utilService.getSortCondition('entity', query.sortBy));
        if (query.search) builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: query.search }));

        console.log(builder.getSql());

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

    async findOne(id: number) {
        const result = await this.roleRepository.findOne({ relations: ['permissions'], where: { id } });
        if (!result) throw new NotFoundException('Không tìm thấy quyền này!');

        const { permissions, ...rest } = result;

        return {
            ...rest,
            permissionIds: permissions.length > 0 ? permissions.map((permission) => permission.id) : [],
        };
    }

    async update(id: number, updateRoleDto: UpdateRoleDto) {
        const { permissionIds, ...rest } = updateRoleDto;
        const result = await this.roleRepository.update(id, rest);

        // delete all permissions of role
        await this.roleRepository.removePermissions(id);

        // add permissions to role
        if (permissionIds?.length) {
            await this.roleRepository.createQueryBuilder().relation('permissions').of(id).add(permissionIds);
        }

        return result;
    }

    async remove(id: number) {
        // TODO: không cho xoá khi có người dùng đang sử dụng
        await this.roleRepository.removePermissions(id);
        return this.roleRepository.delete(id);
    }
}
