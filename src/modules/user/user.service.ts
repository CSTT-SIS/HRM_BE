import { HttpException, Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { MediaService } from '~/modules/media/media.service';
import { TokenService, UtilService } from '~/shared/services';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(
        private readonly tokenService: TokenService,
        private readonly utilService: UtilService,
        private readonly mediaService: MediaService,
        private readonly database: DatabaseService,
    ) {}

    async create(createUserDto: CreateUserDto) {
        const { username, password, ...rest } = createUserDto;

        const accountExist = await this.database.account.countBy({ username });
        if (accountExist) {
            throw new HttpException('Tài khoản đã tồn tại', 400);
        }

        const { salt, hash } = this.tokenService.hashPassword(createUserDto.password);
        const account = await this.database.account.save(
            this.database.account.create({
                username: createUserDto.username,
                password: hash,
                salt,
            }),
        );

        if (!account) {
            throw new HttpException('Cannot create account', 400);
        }

        const user = await this.database.user.save(this.database.user.create({ ...rest, accountId: account.id }));
        if (!user) {
            throw new HttpException('Cannot create user', 400);
        }

        return {
            data: {
                account,
                user,
            },
        };
    }

    async findAll(queries: { page: number; perPage: number; search: string; sortBy: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.user, queries);

        if (!this.utilService.isEmpty(queries.search)) {
            builder.andWhere(this.utilService.fullTextSearch({ fields: ['fullName', 'email'], keyword: queries.search }));
            // builder.andWhere(this.utilService.searchRawQuery({ fields: ['fullName', 'email'], keyword: queries.search }));
        }

        builder.leftJoinAndSelect('entity.role', 'role');
        builder.leftJoinAndSelect('entity.avatar', 'avatar');
        builder.leftJoinAndSelect('entity.department', 'department');
        builder.select(['entity', 'role.id', 'role.name', 'avatar.id', 'avatar.path', 'department.id', 'department.name']);

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
        return this.database.user.findOneUserWithAllRelationsById(id);
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const { username, password, ...rest } = updateUserDto;
        const user = await this.database.user.findOneBy({ id });
        if (!user) {
            throw new HttpException('Không tìm thấy người dùng', 404);
        }

        if (password) {
            const { salt, hash } = this.tokenService.hashPassword(updateUserDto.password);
            this.database.account.update({ id: user.accountId }, { password: hash, salt });
        }

        return await this.database.user.update({ id }, rest);
    }

    async remove(id: number) {
        const user = await this.database.user.findOneBy({ id });
        if (!user) {
            throw new HttpException('Không tìm thấy người dùng', 404);
        }

        // remove user
        await this.database.user.delete({ id });
        // remove account
        await this.database.account.delete({ id: user.accountId });
        // remove media
        if (user.avatarId) {
            await this.mediaService.remove(user.avatarId);
        }

        return true;
    }
}
