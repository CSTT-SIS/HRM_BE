import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { OrderItemEntity } from '~/database/typeorm/entities/orderItem.entity';
import { OrderProgressTrackingEntity } from '~/database/typeorm/entities/orderProgressTracking.entity';
import { ProviderEntity } from '~/database/typeorm/entities/provider.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'orders' })
export class OrderEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'provider_id', type: 'int', unsigned: true, nullable: true })
    providerId: number;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'code', type: 'varchar', length: 255, nullable: true })
    code: string;

    @Column({ name: 'type', type: 'varchar', length: 50, nullable: true })
    type: string;

    @Column({ name: 'status', type: 'varchar', length: 50, nullable: true })
    status: string;

    @Column({ name: 'estimated_delivery_date', type: 'datetime', nullable: true })
    estimatedDeliveryDate: Date;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'updated_by_id', type: 'int', unsigned: true, nullable: true })
    updatedById: number;

    /* RELATIONS */
    @ManyToOne(() => ProviderEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'provider_id', referencedColumnName: 'id' })
    provider: Relation<ProviderEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'updated_by_id', referencedColumnName: 'id' })
    updatedBy: Relation<UserEntity>;

    @OneToMany(() => OrderItemEntity, (entity) => entity.order, { createForeignKeyConstraints: false })
    items: Relation<OrderItemEntity>[];

    @OneToMany(() => OrderProgressTrackingEntity, (entity) => entity.order, { createForeignKeyConstraints: false })
    progresses: Relation<OrderProgressTrackingEntity>[];
}
