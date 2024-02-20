import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { FORGOTTEN_TIMEKEEPING_REQUEST_STATUS } from '~/common/enums/enum';
import { AbstractEntity } from './abstract.entity';
import { StaffEntity } from './staff.entity';

@Entity({ name: 'forgotten_timekeeping_requests' })
export class ForgottenTimekeepingRequestEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
    reason: string;

    @Column({ name: 'request_date', type: 'date', nullable: true })
    requestDate: Date;

    @Column({ name: 'forget_date', type: 'date', nullable: true })
    forgetDate: Date;

    @Column({ name: 'supporting_documents', type: 'varchar', length: 255, nullable: true })
    supportingDocuments: string;

    @Column({ name: 'status', type: 'varchar', length: 255, nullable: true })
    status: FORGOTTEN_TIMEKEEPING_REQUEST_STATUS;

    @Column({ name: 'approver_id', type: 'int', unsigned: true, nullable: true })
    approverId: number;

    @Column({ name: 'approver_date', type: 'date', nullable: true })
    approverDate: Date;

    @Column({ name: 'comments', type: 'varchar', length: 1000, nullable: true })
    comments: string;

    @Column({ name: 'staff_id', type: 'int', unsigned: true, nullable: true })
    staffId: number;

    /* RELATION */
    @ManyToOne(() => StaffEntity, (entity: StaffEntity) => entity.forgottenTimekeepingRequests, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'staff_id', referencedColumnName: 'id' })
    staff: Relation<StaffEntity>;

    @ManyToOne(() => StaffEntity, (entity: StaffEntity) => entity.approvedForgottenTimekeepingRequests, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'approver_id', referencedColumnName: 'id' })
    approver: Relation<StaffEntity>;
}
