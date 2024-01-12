import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation, RelationId } from 'typeorm';
import { InventoryHistoryEntity } from '~/database/typeorm/entities/inventoryHistory.entity';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
import { UnitEntity } from '~/database/typeorm/entities/unit.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'inventory' })
@Index('IDX_INVETORY_WAREHOUSE_PRODUCT', ['warehouseId', 'productId'], { unique: true })
export class InventoryEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'warehouse_id', type: 'int', unsigned: true, nullable: true })
    warehouseId: number;

    @Column({ name: 'product_id', type: 'int', unsigned: true, nullable: true })
    productId: number;

    @Column({ name: 'quantity', type: 'int', unsigned: true, nullable: true })
    quantity: number;

    @Column({ name: 'error_quantity', type: 'int', unsigned: true, nullable: true, default: 0 })
    errorQuantity: number;

    @Column({ name: 'unit_id', type: 'int', unsigned: true, nullable: true })
    unitId: number;

    @Column({ name: 'note', type: 'text', nullable: true })
    note: string;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'min_quantity', type: 'int', unsigned: true, nullable: true, default: 0 })
    minQuantity: number;

    @Column({ name: 'max_quantity', type: 'int', unsigned: true, nullable: true })
    maxQuantity: number;

    @Column({ name: 'is_active', type: 'tinyint', unsigned: true, default: true })
    isActive: boolean;

    /* RELATIONS */
    @ManyToOne(() => WarehouseEntity, (warehouse) => warehouse.inventories, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'warehouse_id', referencedColumnName: 'id' })
    warehouse: Relation<WarehouseEntity>;

    @ManyToOne(() => ProductEntity, (product) => product.inventories, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    product: Relation<ProductEntity>;

    @ManyToOne(() => UserEntity, (user) => user.inventories, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy: Relation<UserEntity>;

    @ManyToOne(() => UnitEntity, (unit) => unit.inventories, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'unit_id', referencedColumnName: 'id' })
    unit: Relation<UnitEntity>;

    @OneToMany(() => InventoryHistoryEntity, (entity) => entity.inventory, { createForeignKeyConstraints: false })
    histories: Relation<InventoryHistoryEntity>[];

    @RelationId((inventory: InventoryEntity) => inventory.histories)
    historyIds: number[];
}
