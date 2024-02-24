import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CACHE_TIME } from '~/common/enums/enum';
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
import { CacheService } from '~/shared/services/cache.service';
import { CalendarRepository } from '~/database/typeorm/repositories/calendar.repository';

@Injectable()
export class DatabaseService {
    constructor(
        private readonly cacheService: CacheService,
        public readonly dataSource: DataSource,
        public readonly department: DepartmentRepository,
        public readonly user: UserRepository,
        public readonly account: AccountRepository,
        public readonly media: MediaRepository,
        public readonly permission: PermissionRepository,
        public readonly role: RoleRepository,
        public readonly userLog: UserLogRepository,
        public readonly warehouse: WarehouseRepository,
        public readonly provider: ProviderRepository,
        public readonly product: ProductRepository,
        public readonly productCategory: ProductCategoryRepository,
        public readonly inventory: InventoryRepository,
        public readonly unit: UnitRepository,
        public readonly inventoryHistory: InventoryHistoryRepository,
        public readonly quantityLimit: QuantityLimitRepository,
        public readonly proposal: ProposalRepository,
        public readonly proposalDetail: ProposalDetailRepository,
        public readonly productMeta: ProductMetaRepository,
        public readonly approvalProcess: ApprovalProcessRepository,
        public readonly warehousingBill: WarehousingBillRepository,
        public readonly warehousingBillDetail: WarehousingBillDetailRepository,
        public readonly stocktake: StocktakeRepository,
        public readonly stocktakeDetail: StocktakeDetailRepository,
        public readonly order: OrderRepository,
        public readonly orderItem: OrderItemRepository,
        public readonly orderProgressTracking: OrderProgressTrackingRepository,
        public readonly receipt: ReceiptRepository,
        public readonly vehicle: VehicleRepository,
        public readonly repairRequest: RepairRequestRepository,
        public readonly repairDetail: RepairDetailRepository,
        public readonly repairProgress: RepairProgressRepository,
        public readonly notification: NotificationRepository,
        public readonly notificationDetail: NotificationDetailRepository,
        public readonly calendar: CalendarRepository,
    ) {
        // load all departments to cache
        // this.loadDepartmentsToCache();
        this.loadPermissionsByRoleToCache();
    }

    private loadDepartmentsToCache() {
        this.department.find().then((departments) => {
            departments.forEach((department) => {
                this.cacheService.setJson(`department:${department.id}`, department, CACHE_TIME.ONE_MONTH);
            });
        });
    }

    private loadPermissionsByRoleToCache() {
        this.role.find({ relations: ['permissions'] }).then((roles) => {
            roles.forEach((role) => {
                this.cacheService.setJson(
                    `permissions:${role.id}`,
                    role.permissions.map((p) => p.action),
                    CACHE_TIME.ONE_MONTH,
                );
            });
        });
    }

    async getUserIdsByPermission(permission: string): Promise<number[]> {
        const result = await this.dataSource.query(
            'SELECT DISTINCT id FROM users WHERE role_id IN (SELECT role_id FROM roles_permissions WHERE permission_id IN (SELECT id FROM permissions WHERE action = ?))',
            [permission],
        );

        return result.map((r) => r?.id).filter((id) => id);
    }
}
