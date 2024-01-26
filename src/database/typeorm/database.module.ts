import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DatabaseService } from '~/database/typeorm/database.service';
import { AccountEntity } from '~/database/typeorm/entities/account.entity';
import { ApprovalProcessEntity } from '~/database/typeorm/entities/approvalProcess.entity';
import { DepartmentEntity } from '~/database/typeorm/entities/department.entity';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';
import { InventoryHistoryEntity } from '~/database/typeorm/entities/inventoryHistory.entity';
import { MediaEntity } from '~/database/typeorm/entities/media.entity';
import { PermissionEntity } from '~/database/typeorm/entities/permission.entity';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
import { ProductCategoryEntity } from '~/database/typeorm/entities/productCategory.entity';
import { ProductMetaEntity } from '~/database/typeorm/entities/productMeta.entity';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { ProposalDetailEntity } from '~/database/typeorm/entities/proposalDetail.entity';
import { ProposalTypeEntity } from '~/database/typeorm/entities/proposalType.entity';
import { ProviderEntity } from '~/database/typeorm/entities/provider.entity';
import { QuantityLimitEntity } from '~/database/typeorm/entities/quantityLimit.entity';
import { RoleEntity } from '~/database/typeorm/entities/role.entity';
import { StocktakeEntity } from '~/database/typeorm/entities/stocktake.entity';
import { StocktakeDetailEntity } from '~/database/typeorm/entities/stocktakeDetail.entity';
import { UnitEntity } from '~/database/typeorm/entities/unit.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { UserLogEntity } from '~/database/typeorm/entities/userLog.entity';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';
import { WarehouseTypeEntity } from '~/database/typeorm/entities/warehouseType.entity';
import { WarehousingBillEntity } from '~/database/typeorm/entities/warehousingBill.entity';
import { WarehousingBillDetailEntity } from '~/database/typeorm/entities/warehousingBillDetail.entity';
import { AccountRepository } from '~/database/typeorm/repositories/account.repository';
import { ApprovalProcessRepository } from '~/database/typeorm/repositories/approvalProcess.repository';
import { DepartmentRepository } from '~/database/typeorm/repositories/department.repository';
import { InventoryRepository } from '~/database/typeorm/repositories/inventory.repository';
import { InventoryHistoryRepository } from '~/database/typeorm/repositories/inventoryHistory.repository';
import { MediaRepository } from '~/database/typeorm/repositories/media.repository';
import { PermissionRepository } from '~/database/typeorm/repositories/permission.repository';
import { ProductRepository } from '~/database/typeorm/repositories/product.repository';
import { ProductCategoryRepository } from '~/database/typeorm/repositories/productCategory.repository';
import { ProductMetaRepository } from '~/database/typeorm/repositories/productMeta.repository';
import { ProposalRepository } from '~/database/typeorm/repositories/proposal.repository';
import { ProposalDetailRepository } from '~/database/typeorm/repositories/proposalDetail.repository';
import { ProposalTypeRepository } from '~/database/typeorm/repositories/proposalType.repository';
import { ProviderRepository } from '~/database/typeorm/repositories/provider.repository';
import { QuantityLimitRepository } from '~/database/typeorm/repositories/quantityLimit.repository';
import { RoleRepository } from '~/database/typeorm/repositories/role.repository';
import { StocktakeRepository } from '~/database/typeorm/repositories/stocktake.repository';
import { StocktakeDetailRepository } from '~/database/typeorm/repositories/stocktakeDetail.repository';
import { UnitRepository } from '~/database/typeorm/repositories/unit.repository';
import { UserRepository } from '~/database/typeorm/repositories/user.repository';
import { UserLogRepository } from '~/database/typeorm/repositories/userLog.repository';
import { WarehouseRepository } from '~/database/typeorm/repositories/warehouse.repository';
import { WarehouseTypeRepository } from '~/database/typeorm/repositories/warehouseType.repository';
import { WarehousingBillRepository } from '~/database/typeorm/repositories/warehousingBill.repository';
import { WarehousingBillDetailRepository } from '~/database/typeorm/repositories/warehousingBillDetail.repository';
import { OrderEntity } from '~/database/typeorm/entities/order.entity';
import { OrderItemEntity } from '~/database/typeorm/entities/orderItem.entity';
import { OrderProgressTrackingEntity } from '~/database/typeorm/entities/orderProgressTracking.entity';
import { OrderRepository } from '~/database/typeorm/repositories/order.repository';
import { OrderItemRepository } from '~/database/typeorm/repositories/orderItem.repository';
import { OrderProgessTrackingRepository } from '~/database/typeorm/repositories/orderProgessTracking.repository';
import { OrderProgressTrackingRepository } from '~/database/typeorm/repositories/orderProgressTracking.repository';

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
    ProposalEntity,
    ProposalTypeEntity,
    ProposalDetailEntity,
    ProductMetaEntity,
    ApprovalProcessEntity,
    WarehousingBillEntity,
    WarehousingBillDetailEntity,
    StocktakeEntity,
    StocktakeDetailEntity,
    OrderEntity,
    OrderItemEntity,
    OrderProgressTrackingEntity,
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
    ProposalRepository,
    ProposalTypeRepository,
    ProposalDetailRepository,
    ProductMetaRepository,
    ApprovalProcessRepository,
    WarehousingBillRepository,
    WarehousingBillDetailRepository,
    StocktakeRepository,
    StocktakeDetailRepository,
    OrderRepository,
    OrderItemRepository,
    OrderProgessTrackingRepository,
    OrderProgressTrackingRepository,
];

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            name: 'default', // HERE
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
