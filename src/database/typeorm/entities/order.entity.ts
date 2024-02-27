import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ORDER_STATUS } from '~/common/enums/enum';
import { OrderItemEntity } from '~/database/typeorm/entities/orderItem.entity';
import { OrderProgressTrackingEntity } from '~/database/typeorm/entities/orderProgressTracking.entity';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'orders' })
export class OrderEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'proposal_id', type: 'int', unsigned: true, nullable: true })
    proposalId: number;

    @Index('IDX_ORDER_NAME', { fulltext: true })
    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Index('IDX_ORDER_CODE', { fulltext: true })
    @Column({ name: 'code', type: 'varchar', length: 255, nullable: true })
    code: string;

    @Column({ name: 'type', type: 'varchar', length: 50, nullable: true })
    type: string;

    @Column({ name: 'status', type: 'varchar', length: 50, nullable: true, default: ORDER_STATUS.PENDING })
    status: string;

    @Column({ name: 'estimated_delivery_date', type: 'datetime', nullable: true })
    estimatedDeliveryDate: Date;

    @Column({ name: 'provider', type: 'text', nullable: true }) // 'internal' | 'external
    provider: string;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'updated_by_id', type: 'int', unsigned: true, nullable: true })
    updatedById: number;

    /* RELATIONS */
    @ManyToOne(() => ProposalEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'proposal_id', referencedColumnName: 'id' })
    proposal: Relation<ProposalEntity>;

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
