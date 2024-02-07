import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { TIME_ATTENDANCE_STATUS } from '~/common/enums/enum';
import { AbstractEntity } from './abstract.entity';
import { StaffEntity } from './staff.entity';

@Entity({ name: 'time_attendances' })
export class TimeAttendanceEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'date', type: 'date', nullable: true })
    date: Date;

    @Column({ name: 'time_in', type: 'datetime', nullable: true })
    timeIn: Date;

    @Column({ name: 'time_out', type: 'datetime', nullable: true })
    timeOut: Date;

    @Column({ name: 'total_hours', type: 'float', nullable: true })
    totalHours: number;

    @Column({ name: 'overtime_hours', type: 'float', nullable: true })
    overtimeHours: number;

    @Column({ name: 'absence_type', type: 'varchar', length: 255, nullable: true })
    absenceType: string;

    @Column({ name: 'absence_reason', type: 'varchar', length: 255, nullable: true })
    absenceReason: string;

    @Column({ name: 'supporting_documents', type: 'string', nullable: true })
    supportingDocuments: string;

    @Column({ name: 'status', type: 'varchar', length: 255, nullable: true })
    status: TIME_ATTENDANCE_STATUS;

    @Column({ name: 'approver_date', type: 'date', nullable: true })
    approverDate: Date;

    @Column({ name: 'comments', type: 'varchar', length: 1000, nullable: true })
    comments: string;

    @Column({ name: 'staff_id', type: 'int', unsigned: true, nullable: true })
    staffId: number;

    /* RELATION */
    @ManyToOne(() => StaffEntity, (entity: StaffEntity) => entity.timeAttendances, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'staff_id', referencedColumnName: 'id' })
    staff: Relation<StaffEntity>;
}