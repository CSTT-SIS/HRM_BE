import { Injectable } from '@nestjs/common';
import { CACHE_TIME } from '~/common/enums/enum';
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
import { CacheService } from '~/shared/services/cache.service';

@Injectable()
export class DatabaseService {
    constructor(
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
        private readonly cacheService: CacheService,
    ) {
        // load all departments to cache
        // this.loadDepartmentsToCache();
        // this.loadPermissionsByRoleToCache();
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
