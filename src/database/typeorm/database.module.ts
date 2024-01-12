import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DatabaseService } from '~/database/typeorm/database.service';
import { AccountEntity } from '~/database/typeorm/entities/account.entity';
import { DepartmentEntity } from '~/database/typeorm/entities/department.entity';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';
import { InventoryHistoryEntity } from '~/database/typeorm/entities/inventoryHistory.entity';
import { MediaEntity } from '~/database/typeorm/entities/media.entity';
import { PermissionEntity } from '~/database/typeorm/entities/permission.entity';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
import { ProductCategoryEntity } from '~/database/typeorm/entities/productCategory.entity';
import { ProviderEntity } from '~/database/typeorm/entities/provider.entity';
import { QuantityLimitEntity } from '~/database/typeorm/entities/quantityLimit.entity';
import { RoleEntity } from '~/database/typeorm/entities/role.entity';
import { UnitEntity } from '~/database/typeorm/entities/unit.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { UserLogEntity } from '~/database/typeorm/entities/userLog.entity';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';
import { WarehouseTypeEntity } from '~/database/typeorm/entities/warehouseType.entity';
import { AccountRepository } from '~/database/typeorm/repositories/account.repository';
import { DepartmentRepository } from '~/database/typeorm/repositories/department.repository';
import { InventoryRepository } from '~/database/typeorm/repositories/inventory.repository';
import { InventoryHistoryRepository } from '~/database/typeorm/repositories/inventoryHistory.repository';
import { MediaRepository } from '~/database/typeorm/repositories/media.repository';
import { PermissionRepository } from '~/database/typeorm/repositories/permission.repository';
import { ProductRepository } from '~/database/typeorm/repositories/product.repository';
import { ProductCategoryRepository } from '~/database/typeorm/repositories/productCategory.repository';
import { ProviderRepository } from '~/database/typeorm/repositories/provider.repository';
import { QuantityLimitRepository } from '~/database/typeorm/repositories/quantityLimit.repository';
import { RoleRepository } from '~/database/typeorm/repositories/role.repository';
import { UnitRepository } from '~/database/typeorm/repositories/unit.repository';
import { UserRepository } from '~/database/typeorm/repositories/user.repository';
import { UserLogRepository } from '~/database/typeorm/repositories/userLog.repository';
import { WarehouseRepository } from '~/database/typeorm/repositories/warehouse.repository';
import { WarehouseTypeRepository } from '~/database/typeorm/repositories/warehouseType.repository';

const entities = [
    RoleEntity,
    UserEntity,
    PermissionEntity,
    MediaEntity,
    AccountEntity,
    DepartmentEntity,
    WarehouseEntity,
    UserLogEntity,
    WarehouseTypeEntity,
    ProviderEntity,
    ProductEntity,
    ProductCategoryEntity,
    InventoryEntity,
    UnitEntity,
    InventoryHistoryEntity,
    QuantityLimitEntity,
];

const repositories = [
    DepartmentRepository,
    UserRepository,
    AccountRepository,
    MediaRepository,
    PermissionRepository,
    RoleRepository,
    WarehouseRepository,
    UserLogRepository,
    WarehouseTypeRepository,
    ProviderRepository,
    ProductRepository,
    ProductCategoryRepository,
    InventoryRepository,
    UnitRepository,
    InventoryHistoryRepository,
    QuantityLimitRepository,
];

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                ...configService.get('database'),
                entities,
            }),
            inject: [ConfigService],
            // dataSource receives the configured DataSourceOptions
            // and returns a Promise<DataSource>.
            dataSourceFactory: async (options) => {
                const dataSource = await new DataSource(options).initialize();
                return dataSource;
            },
        }),
        // TypeOrmModule.forFeature(entities),
    ],
    providers: [DatabaseService, ...repositories],
    exports: [DatabaseService],
})
export class DatabaseModule {}
