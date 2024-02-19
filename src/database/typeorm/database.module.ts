import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DatabaseService } from '~/database/typeorm/database.service';
import { AccountEntity } from '~/database/typeorm/entities/account.entity';
import { ApprovalProcessEntity } from '~/database/typeorm/entities/approvalProcess.entity';
import { AssetEntity } from '~/database/typeorm/entities/asset.entity';
import { CalendarEntity } from '~/database/typeorm/entities/calendar.entity';
import { ContractEntity } from '~/database/typeorm/entities/contract.entity';
import { DepartmentEntity } from '~/database/typeorm/entities/department.entity';
import { DepartmentTaskEntity } from '~/database/typeorm/entities/departmentTask.entity';
import { DisciplineEntity } from '~/database/typeorm/entities/discipline.entity';
import { DocumentEntity } from '~/database/typeorm/entities/document.entity';
import { EmployeeLeaveRequestEntity } from '~/database/typeorm/entities/employeeLeaveRequest.entity';
import { ForgottenTimekeepingRequestEntity } from '~/database/typeorm/entities/forgottenTimekeepingRequest.entity';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';
import { InventoryHistoryEntity } from '~/database/typeorm/entities/inventoryHistory.entity';
import { LeaveApplicationEntity } from '~/database/typeorm/entities/leaveApplication.entity';
import { MediaEntity } from '~/database/typeorm/entities/media.entity';
import { NotificationEntity } from '~/database/typeorm/entities/notification.entity';
import { NotificationDetailEntity } from '~/database/typeorm/entities/notificationDetail.entity';
import { OrderEntity } from '~/database/typeorm/entities/order.entity';
import { OrderItemEntity } from '~/database/typeorm/entities/orderItem.entity';
import { OrderProgressTrackingEntity } from '~/database/typeorm/entities/orderProgressTracking.entity';
import { OvertimeRequestEntity } from '~/database/typeorm/entities/overtimeRequest.entity';
import { PermissionEntity } from '~/database/typeorm/entities/permission.entity';
import { PositionEntity } from '~/database/typeorm/entities/position.entity';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
import { ProductCategoryEntity } from '~/database/typeorm/entities/productCategory.entity';
import { ProductMetaEntity } from '~/database/typeorm/entities/productMeta.entity';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { ProposalDetailEntity } from '~/database/typeorm/entities/proposalDetail.entity';
import { ProviderEntity } from '~/database/typeorm/entities/provider.entity';
import { QuantityLimitEntity } from '~/database/typeorm/entities/quantityLimit.entity';
import { ReceiptEntity } from '~/database/typeorm/entities/receipt.entity';
import { RepairDetailEntity } from '~/database/typeorm/entities/repairDetail.entity';
import { RepairProgressEntity } from '~/database/typeorm/entities/repairProgress.entity';
import { RepairRequestEntity } from '~/database/typeorm/entities/repairRequest.entity';
import { ResignationFormEntity } from '~/database/typeorm/entities/resignationForm.entity';
import { RewardEntity } from '~/database/typeorm/entities/reward.entity';
import { RoleEntity } from '~/database/typeorm/entities/role.entity';
import { SendDocumentEntity } from '~/database/typeorm/entities/sendDocument.entity';
import { ShiftEntity } from '~/database/typeorm/entities/shift.entity';
import { StaffEntity } from '~/database/typeorm/entities/staff.entity';
import { StaffShiftEntity } from '~/database/typeorm/entities/staffShift.entity';
import { StocktakeEntity } from '~/database/typeorm/entities/stocktake.entity';
import { StocktakeDetailEntity } from '~/database/typeorm/entities/stocktakeDetail.entity';
import { TaskEntity } from '~/database/typeorm/entities/task.entity';
import { TextEmbryoEntity } from '~/database/typeorm/entities/textEmbryo.entity';
import { TimeAttendanceEntity } from '~/database/typeorm/entities/timeAttendance.entity';
import { UnitEntity } from '~/database/typeorm/entities/unit.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { UserLogEntity } from '~/database/typeorm/entities/userLog.entity';
import { VehicleEntity } from '~/database/typeorm/entities/vehicle.entity';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';
import { WarehousingBillEntity } from '~/database/typeorm/entities/warehousingBill.entity';
import { WarehousingBillDetailEntity } from '~/database/typeorm/entities/warehousingBillDetail.entity';
import { AccountRepository } from '~/database/typeorm/repositories/account.repository';
import { ApprovalProcessRepository } from '~/database/typeorm/repositories/approvalProcess.repository';
import { DepartmentRepository } from '~/database/typeorm/repositories/department.repository';
import { InventoryRepository } from '~/database/typeorm/repositories/inventory.repository';
import { InventoryHistoryRepository } from '~/database/typeorm/repositories/inventoryHistory.repository';
import { MediaRepository } from '~/database/typeorm/repositories/media.repository';
import { NotificationRepository } from '~/database/typeorm/repositories/notification.repository';
import { NotificationDetailRepository } from '~/database/typeorm/repositories/notificationDetail.repository';
import { OrderRepository } from '~/database/typeorm/repositories/order.repository';
import { OrderItemRepository } from '~/database/typeorm/repositories/orderItem.repository';
import { OrderProgressTrackingRepository } from '~/database/typeorm/repositories/orderProgressTracking.repository';
import { PermissionRepository } from '~/database/typeorm/repositories/permission.repository';
import { ProductRepository } from '~/database/typeorm/repositories/product.repository';
import { ProductCategoryRepository } from '~/database/typeorm/repositories/productCategory.repository';
import { ProductMetaRepository } from '~/database/typeorm/repositories/productMeta.repository';
import { ProposalRepository } from '~/database/typeorm/repositories/proposal.repository';
import { ProposalDetailRepository } from '~/database/typeorm/repositories/proposalDetail.repository';
import { ProviderRepository } from '~/database/typeorm/repositories/provider.repository';
import { QuantityLimitRepository } from '~/database/typeorm/repositories/quantityLimit.repository';
import { ReceiptRepository } from '~/database/typeorm/repositories/receipt.repository';
import { RepairDetailRepository } from '~/database/typeorm/repositories/repairDetail.repository';
import { RepairProgressRepository } from '~/database/typeorm/repositories/repairProgress.repository';
import { RepairRequestRepository } from '~/database/typeorm/repositories/repairRequest.repository';
import { RoleRepository } from '~/database/typeorm/repositories/role.repository';
import { StocktakeRepository } from '~/database/typeorm/repositories/stocktake.repository';
import { StocktakeDetailRepository } from '~/database/typeorm/repositories/stocktakeDetail.repository';
import { UnitRepository } from '~/database/typeorm/repositories/unit.repository';
import { UserRepository } from '~/database/typeorm/repositories/user.repository';
import { UserLogRepository } from '~/database/typeorm/repositories/userLog.repository';
import { VehicleRepository } from '~/database/typeorm/repositories/vehicle.repository';
import { WarehouseRepository } from '~/database/typeorm/repositories/warehouse.repository';
import { WarehousingBillRepository } from '~/database/typeorm/repositories/warehousingBill.repository';
import { WarehousingBillDetailRepository } from '~/database/typeorm/repositories/warehousingBillDetail.repository';

const entities = [
    RoleEntity,
    UserEntity,
    PermissionEntity,
    MediaEntity,
    AccountEntity,
    DepartmentEntity,
    WarehouseEntity,
    UserLogEntity,
    ProviderEntity,
    ProductEntity,
    ProductCategoryEntity,
    InventoryEntity,
    UnitEntity,
    InventoryHistoryEntity,
    QuantityLimitEntity,
    ProposalEntity,
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
    ReceiptEntity,
    VehicleEntity,
    RepairRequestEntity,
    RepairDetailEntity,
    RepairProgressEntity,
    NotificationEntity,
    NotificationDetailEntity,
    StaffEntity,
    DepartmentEntity,
    CalendarEntity,
    ContractEntity,
    PositionEntity,
    LeaveApplicationEntity,
    ShiftEntity,
    StaffShiftEntity,
    DisciplineEntity,
    ResignationFormEntity,
    EmployeeLeaveRequestEntity,
    ForgottenTimekeepingRequestEntity,
    OvertimeRequestEntity,
    TimeAttendanceEntity,
    TaskEntity,
    DepartmentTaskEntity,
    RewardEntity,
    AssetEntity,
    DocumentEntity,
    SendDocumentEntity,
    TextEmbryoEntity,
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
    ProviderRepository,
    ProductRepository,
    ProductCategoryRepository,
    InventoryRepository,
    UnitRepository,
    InventoryHistoryRepository,
    QuantityLimitRepository,
    ProposalRepository,
    ProposalDetailRepository,
    ProductMetaRepository,
    ApprovalProcessRepository,
    WarehousingBillRepository,
    WarehousingBillDetailRepository,
    StocktakeRepository,
    StocktakeDetailRepository,
    OrderRepository,
    OrderItemRepository,
    OrderProgressTrackingRepository,
    ReceiptRepository,
    VehicleRepository,
    RepairRequestRepository,
    RepairDetailRepository,
    RepairProgressRepository,
    NotificationRepository,
    NotificationDetailRepository,
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
