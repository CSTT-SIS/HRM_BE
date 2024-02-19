import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'warehouses' })
export class WarehouseEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'parent_id', type: 'int', unsigned: true, nullable: true })
    parentId: number;

    @Column({ name: 'parent_path', type: 'varchar', length: 255, nullable: true })
    parentPath: string;

    @Index('IDX_WAREHOUSE_NAME', { fulltext: true })
    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Index('IDX_WAREHOUSE_CODE', { fulltext: true })
    @Column({ name: 'code', type: 'varchar', length: 255, nullable: true })
    code: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @Column({ name: 'address', type: 'text', nullable: true })
    address: string;

    @Column({ name: 'manager_id', type: 'int', unsigned: true, nullable: true })
    managerId: number;

    /* RELATIONS */
    @OneToMany(() => InventoryEntity, (inventory) => inventory.warehouse, { createForeignKeyConstraints: false })
    inventories: Relation<InventoryEntity>[];

    @ManyToOne(() => UserEntity, { nullable: true, createForeignKeyConstraints: false })
    @JoinColumn({ name: 'manager_id', referencedColumnName: 'id' })
    manager: Relation<UserEntity>;
}
