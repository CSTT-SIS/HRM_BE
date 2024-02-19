import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { LEAVE_STATUS } from '~/common/enums/enum';
import { StaffEntity } from '~/database/typeorm/entities/staff.entity';

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

    @Column({ name: 'staff_id', type: 'int', unsigned: true, nullable: true })
    staffId: number;

    @Column({ name: 'approved_by', type: 'int', unsigned: true, nullable: true })
    approvedBy: number;

    /* RELATION */
    @ManyToOne(() => StaffEntity, (entity: StaffEntity) => entity.leaveApplications, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'staff_id', referencedColumnName: 'id' })
    staff: Relation<StaffEntity>;

    @ManyToOne(() => StaffEntity, (entity: StaffEntity) => entity.approvedLeaveApplications, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'approved_by', referencedColumnName: 'id' })
    approvedByStaff: Relation<StaffEntity>;
}
