import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { FORGOTTEN_TIMEKEEPING_REQUEST_STATUS } from '~/common/enums/enum';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';

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

    @Column({ type: 'enum', enum: FORGOTTEN_TIMEKEEPING_REQUEST_STATUS, default: FORGOTTEN_TIMEKEEPING_REQUEST_STATUS.PENDING })
    status: FORGOTTEN_TIMEKEEPING_REQUEST_STATUS;

    @Column({ name: 'approver_id', type: 'int', unsigned: true, nullable: true })
    approverId: number;

    @Column({ name: 'approver_date', type: 'date', nullable: true })
    approverDate: Date;

    @Column({ name: 'comments', type: 'varchar', length: 1000, nullable: true })
    comments: string;

    @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
    userId: number;

    /* RELATION */
    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.forgottenTimekeepingRequests, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.approvedForgottenTimekeepingRequests, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'approver_id', referencedColumnName: 'id' })
    approver: Relation<UserEntity>;
}
