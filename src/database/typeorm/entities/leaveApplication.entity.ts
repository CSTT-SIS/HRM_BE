import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { LEAVE_STATUS } from '~/common/enums/enum';
import { UserEntity } from './user.entity';

@Entity({ name: 'leave_applications' })
export class LeaveApplicationEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
    reason: string;

    @Column({ name: 'start_day', type: 'date', nullable: true })
    startDay: Date;

    @Column({ name: 'end_day', type: 'date', nullable: true })
    endDay: Date;

    @Column({ type: 'enum', enum: LEAVE_STATUS, default: LEAVE_STATUS.PENDING })
    status: LEAVE_STATUS;

    @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
    userId: number;

    @Column({ name: 'approved_by', type: 'int', unsigned: true, nullable: true })
    approvedBy: number;

    /* RELATION */
    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.leaveApplications, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.approvedLeaveApplications, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'approved_by', referencedColumnName: 'id' })
    approvedByUser: Relation<UserEntity>;
}
