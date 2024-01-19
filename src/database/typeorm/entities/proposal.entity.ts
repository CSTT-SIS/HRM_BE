import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { PROPOSAL_STATUS } from '~/common/enums/enum';
import { ProposalDetailEntity } from '~/database/typeorm/entities/proposalDetail.entity';
import { ProposalTypeEntity } from '~/database/typeorm/entities/proposalType.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'proposals' })
export class ProposalEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'type_id', type: 'int', unsigned: true, nullable: true })
    typeId: number;

    @Index('IDX_PROPOSAL_NAME', { fulltext: true })
    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'content', type: 'text', nullable: true })
    content: string;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'updated_by_id', type: 'int', unsigned: true, nullable: true })
    updatedById: number;

    @Column({ name: 'status', type: 'varchar', length: 255, default: PROPOSAL_STATUS.PENDING })
    status: PROPOSAL_STATUS;

    /* RELATIONS */
    @ManyToOne(() => ProposalTypeEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'type_id', referencedColumnName: 'id' })
    type: Relation<ProposalTypeEntity>;

    @ManyToOne(() => UserEntity, (user) => user.proposals, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'updated_by_id', referencedColumnName: 'id' })
    updatedBy: Relation<UserEntity>;

    @OneToMany(() => ProposalDetailEntity, (entity) => entity.proposal, { createForeignKeyConstraints: false })
    details: Relation<ProposalDetailEntity>[];
}
