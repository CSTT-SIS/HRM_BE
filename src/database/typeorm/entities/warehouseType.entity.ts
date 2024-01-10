import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'warehouse_types' })
export class WarehouseTypeEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Index('IDX_WAREHOUSE_TYPE_NAME', { fulltext: true })
    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    /* RELATIONS */
    @OneToMany(() => WarehouseEntity, (warehouse) => warehouse.type, { createForeignKeyConstraints: false })
    warehouses: Relation<WarehouseTypeEntity>[];
}
