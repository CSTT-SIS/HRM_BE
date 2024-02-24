import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { OVERTIME_REQUEST_STATUS } from '~/common/enums/enum';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';

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

    @Column({ name: 'overtime_rate', type: 'varchar', length: 255, nullable: true })
    overtimeRate: string;

    @Column({ name: 'overtime_amount', type: 'varchar', length: 255, nullable: true })
    overtimeAmount: string;

    @Column({ name: 'supporting_documents', type: 'varchar', length: 255, nullable: true })
    supportingDocuments: string;

    @Column({ type: 'enum', enum: OVERTIME_REQUEST_STATUS, default: OVERTIME_REQUEST_STATUS.PENDING })
    status: OVERTIME_REQUEST_STATUS;

    @Column({ name: 'approver_id', type: 'int', unsigned: true, nullable: true })
    approverId: number;

    @Column({ name: 'approver_date', type: 'date', nullable: true })
    approverDate: Date;

    @Column({ name: 'comments', type: 'varchar', length: 1000, nullable: true })
    comments: string;

    @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
    userId: number;

    @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true })
    createdBy: number;

    @Column({ name: 'updated_by', type: 'int', unsigned: true, nullable: true })
    updatedBy: number;

    /* RELATION */
    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.overtimeRequests, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.approvedOvertimeRequests, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'approver_id', referencedColumnName: 'id' })
    approver: Relation<UserEntity>;
}
