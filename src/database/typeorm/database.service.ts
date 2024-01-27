import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CACHE_TIME } from '~/common/enums/enum';
import { AccountRepository } from '~/database/typeorm/repositories/account.repository';
import { ApprovalProcessRepository } from '~/database/typeorm/repositories/approvalProcess.repository';
import { DepartmentRepository } from '~/database/typeorm/repositories/department.repository';
import { InventoryRepository } from '~/database/typeorm/repositories/inventory.repository';
import { InventoryHistoryRepository } from '~/database/typeorm/repositories/inventoryHistory.repository';
import { MediaRepository } from '~/database/typeorm/repositories/media.repository';
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
import { CacheService } from '~/shared/services/cache.service';
import { ReceiptRepository } from '~/database/typeorm/repositories/receipt.repository';

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
        public readonly warehouseType: WarehouseTypeRepository,
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
}
