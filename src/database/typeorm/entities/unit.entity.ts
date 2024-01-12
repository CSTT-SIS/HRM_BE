import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'units' })
export class UnitEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    /* RELATIONS */
    @OneToMany(() => InventoryEntity, (entity) => entity.unit, { createForeignKeyConstraints: false })
    inventories: Relation<InventoryEntity>[];
}
