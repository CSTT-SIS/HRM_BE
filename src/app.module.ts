import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import { MiddlewareConsumer, Module, OnModuleInit, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { RedisModule } from 'nestjs-redis';
import path from 'path';
import { BYPASS_PERMISSION, ONLY_ADMIN } from '~/common/constants/constant';
import { AllExceptionsFilter } from '~/common/filters/exception.filter';
import { TypeOrmFilter } from '~/common/filters/typeorm.filter';
import { PermissionGuard } from '~/common/guards';
import { AuthMiddleware, LogMiddleware } from '~/common/middleware';
import { IsIdAlreadyExistConstraint } from '~/common/validators/is-id-exist.validator';
import database from '~/config/database.config';
import mail from '~/config/mail.config';
import redis from '~/config/redis.config';
import token from '~/config/token.config';
import { DatabaseModule } from '~/database/typeorm';
import { PermissionRepository } from '~/database/typeorm/repositories/permission.repository';
import { AuthModule } from '~/modules/auth/auth.module';
import { DropdownModule } from '~/modules/dropdown/dropdown.module';
import { MailModule } from '~/modules/mail/mail.module';
import { MediaModule } from '~/modules/media/media.module';
import { NotificationModule } from '~/modules/notification/notification.module';
import { OrderModule } from '~/modules/order/order.module';
import { PermissionModule } from '~/modules/permission/permission.module';
import { ProfileModule } from '~/modules/profile/profile.module';
import { ProposalModule } from '~/modules/proposal/proposal.module';
import { RepairRequestModule } from '~/modules/repair-request/repair-request.module';
import { RoleModule } from '~/modules/role/role.module';
import { SocketModule } from '~/modules/socket/socket.module';
import { StatisticModule } from '~/modules/statistic/statistic.module';
import { StocktakeModule } from '~/modules/stocktake/stocktake.module';
import { WarehousingBillModule } from '~/modules/warehousing-bill/warehousing-bill.module';
import { UtilService } from '~/shared/services';
import { CacheService } from '~/shared/services/cache.service';
import { SharedModule } from '~/shared/shared.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DepartmentModule } from './modules/department/department.module';
import { ProductCategoryModule } from './modules/product-category/product-category.module';
import { ProductModule } from './modules/product/product.module';
import { UnitModule } from './modules/unit/unit.module';
import { UserModule } from './modules/user/user.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { HumanModule } from '~/modules/human/human.module';
import { CalendarModule } from '~/modules/calendar/calendar.module';
import { LetterModule } from '~/modules/letter/letter.module';
import { ForgottenTimekeepingModule } from '~/modules/forgotten-timekeeping/forgotten-timekeeping.module';
import { OverTimeModule } from '~/modules/over-time/over-time.module';
import { TimeKeepingModule } from '~/modules/time-keeping/time-keeping.module';
import { TaskModule } from '~/modules/task/task.module';
import { FreeTimekeepingModule } from '~/modules/free-timekeeping/free-timekeeping.module';
import { PositionModule } from '~/modules/position/position.module';
import { ContractModule } from '~/modules/contract/contract.module';
import { HolidayModule } from '~/modules/holiday/holiday.module';
import { ShiftModule } from '~/modules/shift/shift.module';
import { UserShiftModule } from '~/modules/user-shift/user-shift.module';


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
        I18nModule.forRoot({
            fallbackLanguage: 'en',
            loaderOptions: {
                path: path.join(__dirname, '/i18n/'),
                watch: true,
            },
            resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver, new HeaderResolver(['x-lang'])],
        }),
        EventEmitterModule.forRoot(),
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
        ProductModule,
        ProductCategoryModule,
        UnitModule,
        ProposalModule,
        WarehousingBillModule,
        StocktakeModule,
        OrderModule,
        DropdownModule,
        RepairRequestModule,
        NotificationModule,
        StatisticModule,
        HumanModule,
        CalendarModule,
        LetterModule,
        ForgottenTimekeepingModule,
        OverTimeModule,
        TimeKeepingModule,
        TaskModule,
        FreeTimekeepingModule,
        PositionModule,
        ContractModule,
        HolidayModule,
        ShiftModule,
        UserShiftModule,
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
        IsIdAlreadyExistConstraint,
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
        for (const permission of permissions) {
            const action = permission.meta[0] || permission.meta;
            if ([BYPASS_PERMISSION, ONLY_ADMIN].includes(action)) continue;

            const permissionEntity = this.permissionRepositopry.create({
                name:
                    (this.utilService.capitalizeFirstLetter(permission.discoveredMethod.methodName?.split(/(?=[A-Z])/)?.join(' ')) || '') +
                    ' ' +
                    permission.discoveredMethod.parentClass.name.replace('Controller', ''),
                action: action,
                type: action.split(':')[0],
            });

            this.permissionRepositopry.findOne({ where: { action } }).then((res) => {
                if (!res) {
                    this.permissionRepositopry
                        .insert(permissionEntity)
                        .then((res) => {
                            console.log('LOG:: Permission inserted:', res.identifiers[0].id, permissionEntity.action);
                        })
                        .catch((err) => {});
                }
            });
        }
    }
}
