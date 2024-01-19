import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { PROPOSAL_STATUS } from '~/common/enums/enum';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { WarehousingBillEntity } from '~/database/typeorm/entities/warehousingBill.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'approval_processes' })
export class ApprovalProcessEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'proposal_id', type: 'int', unsigned: true, nullable: true })
    proposalId: number;

    @Column({ name: 'warehousing_bill_id', type: 'int', unsigned: true, nullable: true })
    warehousingBillId: number;

    @Column({ name: 'user_id', type: 'int', unsigned: true })
    userId: number;

    @Column({ name: 'from', type: 'varchar', length: 50 })
    from: PROPOSAL_STATUS;

    @Column({ name: 'to', type: 'varchar', length: 50 })
    to: PROPOSAL_STATUS;

    @Column({ name: 'comment', type: 'varchar', length: 255, nullable: true })
    comment: string;

    /* RELATIONS */
    @ManyToOne(() => ProposalEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'proposal_id', referencedColumnName: 'id' })
    proposal: Relation<ProposalEntity>;

    @ManyToOne(() => WarehousingBillEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'warehousing_bill_id', referencedColumnName: 'id' })
    warehousingBill: Relation<WarehousingBillEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Relation<UserEntity>;
}
