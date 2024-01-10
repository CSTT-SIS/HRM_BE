import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { WarehouseTypeEntity } from '~/database/typeorm/entities/warehouseType.entity';
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

    @Column({ name: 'type_id', type: 'int', unsigned: true, nullable: true })
    typeId: number;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @Column({ name: 'address', type: 'text', nullable: true })
    address: string;

    /* RELATIONS */
    @ManyToOne(() => WarehouseTypeEntity, (type) => type.warehouses, { nullable: true, createForeignKeyConstraints: false })
    @JoinColumn({ name: 'type_id', referencedColumnName: 'id' })
    type: Relation<WarehouseTypeEntity>;
}
