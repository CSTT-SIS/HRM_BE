import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { OVERTIME_REQUEST_STATUS } from '~/common/enums/enum';
import { AbstractEntity } from './abstract.entity';
import { StaffEntity } from './staff.entity';

@Entity({ name: 'overtime_requests' })
export class OvertimeRequestEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
    reason: string;

    @Column({ name: 'request_date', type: 'date', nullable: true })
    requestDate: Date;

    @Column({ name: 'overtime_date', type: 'date', nullable: true })
    overtimeDate: Date;

    @Column({ name: 'overtime_hours', type: 'int', nullable: true })
    overtimeHours: number;

    @Column({ name: 'overtime_rate', type: 'float', nullable: true })
    overtimeRate: number;

    @Column({ name: 'overtime_amount', type: 'float', nullable: true })
    overtimeAmount: number;

    @Column({ name: 'supporting_documents', type: 'varchar', length: 255, nullable: true })
    supportingDocuments: string;

    @Column({ name: 'status', type: 'varchar', length: 255, nullable: true })
    status: OVERTIME_REQUEST_STATUS;

    @Column({ name: 'approver_id', type: 'int', unsigned: true, nullable: true })
    approverId: number;

    @Column({ name: 'approver_date', type: 'date', nullable: true })
    approverDate: Date;

    @Column({ name: 'comments', type: 'varchar', length: 1000, nullable: true })
    comments: string;

    @Column({ name: 'staff_id', type: 'int', unsigned: true, nullable: true })
    staffId: number;

    /* RELATION */
    @ManyToOne(() => StaffEntity, (entity: StaffEntity) => entity.overtimeRequests, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'staff_id', referencedColumnName: 'id' })
    staff: Relation<StaffEntity>;

    @ManyToOne(() => StaffEntity, (entity: StaffEntity) => entity.approvedOvertimeRequests, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'approver_id', referencedColumnName: 'id' })
    approver: Relation<StaffEntity>;
}
