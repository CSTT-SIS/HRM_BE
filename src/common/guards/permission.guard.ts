/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { DataSource } from 'typeorm';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { PERMISSION_KEY } from '~/common/decorators/permission.decorator';
import { CACHE_TIME, USER_ROLE } from '~/common/enums/enum';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { CacheService } from '~/shared/services/cache.service';

const URLs = ['auth', 'docs'];

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private reflector: Reflector, private dataSource: DataSource, private readonly cacheService: CacheService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        if (URLs.some((url) => req.originalUrl.includes(url))) return true;
        const permission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [context.getHandler(), context.getClass()]);
        if (!permission) return false;

        return this.verifyPermission({
            req: req,
            permission: permission[0],
            params: req.params,
        });
    }

    private async verifyPermission(data: { req: Request; permission: string; params: any }) {
        try {
            if (data.permission === BYPASS_PERMISSION) return true;

            const userId = data.req.headers['_userId']; // sau khi qua authMiddleware thì đã add _kId vào body
            const user = await this.getUser(+userId || 0);
            if (!user) return false;

            // if user is admin
            if (user.roleId === USER_ROLE.ADMIN) {
                data.req.headers['_roleId'] = user.roleId.toString();
                data.req.headers['_fullName'] = user.fullName;
                return true;
            }

            const permissions = await this.getPermissions(user.roleId);
            if (permissions.length === 0) return false;
            // check if permission is in permissions
            if (!permissions.some((p) => p.action === data.permission)) return false;

            data.req.headers['_roleId'] = user.roleId.toString();
            data.req.headers['_fullName'] = user.fullName;

            return true;
        } catch (error) {
            console.log('LOG:: error:', error.stack);
            console.log('LOG:: PermissionGuard:', error.message);
            return false;
        }
    }

    private async getPermissions(roleId: number) {
        const key = `permissions:${roleId}`;
        const cached = await this.cacheService.getJson(key);
        if (cached) return cached;

        const entityManager = this.dataSource.manager;
        const permissions = await entityManager.query(`
            SELECT p.action
            FROM roles_permissions as rp, permissions as p
            WHERE rp.role_id = ${roleId}
                AND rp.permission_id = p.id
        `);
        this.cacheService.setJson(key, permissions, CACHE_TIME.ONE_MONTH);

        return permissions;
    }

    private async getUser(id: number): Promise<UserEntity> {
        const key = `userData:${id}`;
        const cached = await this.cacheService.getJson(key);
        if (cached) return cached;

        const entityManager = this.dataSource.manager;
        const user = await entityManager.findOne(UserEntity, { where: { id: id }, select: ['id', 'roleId', 'fullName'] });
        return user;
    }
}
