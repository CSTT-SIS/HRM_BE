import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import { MiddlewareConsumer, Module, OnModuleInit, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { RedisModule } from 'nestjs-redis';
import { BYPASS_PERMISSION, ONLY_ADMIN } from '~/common/constants/constant';
import { AllExceptionsFilter } from '~/common/filters/exception.filter';
import { TypeOrmFilter } from '~/common/filters/typeorm.filter';
import { PermissionGuard } from '~/common/guards';
import { AuthMiddleware, LogMiddleware } from '~/common/middleware';
import database from '~/config/database.config';
import mail from '~/config/mail.config';
import redis from '~/config/redis.config';
import token from '~/config/token.config';
import { DatabaseModule } from '~/database/typeorm';
import { PermissionRepository } from '~/database/typeorm/repositories/permission.repository';
import { AuthModule } from '~/modules/auth/auth.module';
import { MailModule } from '~/modules/mail/mail.module';
import { MediaModule } from '~/modules/media/media.module';
import { PermissionModule } from '~/modules/permission/permission.module';
import { ProfileModule } from '~/modules/profile/profile.module';
import { RoleModule } from '~/modules/role/role.module';
import { SocketModule } from '~/modules/socket/socket.module';
import { UtilService } from '~/shared/services';
import { CacheService } from '~/shared/services/cache.service';
import { SharedModule } from '~/shared/shared.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DepartmentModule } from './modules/department/department.module';
import { ProviderModule } from './modules/provider/provider.module';
import { UserModule } from './modules/user/user.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
            load: [token, database, mail, redis],
            cache: true,
        }),
        RedisModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => configService.get('redis') || {},
            inject: [ConfigService],
        }),
        DatabaseModule,
        SharedModule,
        AuthModule,
        ProfileModule,
        RoleModule,
        PermissionModule,
        MailModule,
        DiscoveryModule,
        MediaModule,
        SocketModule,
        UserModule,
        DepartmentModule,
        WarehouseModule,
        ProviderModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
        {
            provide: APP_FILTER,
            useClass: TypeOrmFilter,
        },
        {
            provide: APP_GUARD,
            useClass: PermissionGuard,
        },
        PermissionRepository,
    ],
})
// export class AppModule { }

// api protected by auth token middleware
// the middleware adds the user's _id to the req.body
export class AppModule implements OnModuleInit {
    constructor(
        private readonly discover: DiscoveryService,
        private readonly permissionRepositopry: PermissionRepository,
        private readonly cacheService: CacheService,
        private readonly utilService: UtilService,
    ) {}
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware, LogMiddleware)
            .exclude(
                { path: 'public/(.*)', method: RequestMethod.ALL },
                { path: 'docs', method: RequestMethod.ALL },
                { path: 'auth/(.*)', method: RequestMethod.ALL },
                { path: 'test', method: RequestMethod.ALL },
            )
            .forRoutes({ path: '*', method: RequestMethod.ALL });
    }

    onModuleInit() {
        // open this to insert permissions to database
        this.cacheService.deletePattern('');
        this.insertPermissions();
    }

    async insertPermissions() {
        const permissions = await this.discover.controllerMethodsWithMetaAtKey<string>('permission');
        permissions.forEach((permission) => {
            const action = permission.meta[0] || permission.meta;
            if ([BYPASS_PERMISSION, ONLY_ADMIN].includes(action)) return;

            const permissionEntity = this.permissionRepositopry.create({
                name:
                    (this.utilService.capitalizeFirstLetter(permission.discoveredMethod.methodName?.split(/(?=[A-Z])/)?.join(' ')) || '') +
                    ' ' +
                    permission.discoveredMethod.parentClass.name.replace('Controller', ''),
                action: action,
                type: action.split(':')[0],
            });

            this.permissionRepositopry
                .insert(permissionEntity)
                .then((res) => {
                    console.log('LOG:: Permission inserted:', res.identifiers[0].id, permissionEntity.action);
                })
                .catch((err) => {});
        });
    }
}
