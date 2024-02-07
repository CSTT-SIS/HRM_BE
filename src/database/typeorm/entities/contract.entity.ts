import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { CONTRACT_STATUS, CONTRACT_TYPE, CONTRACT_RESULT } from '~/common/enums/enum';
import { AbstractEntity } from './abstract.entity';
import { StaffEntity } from './staff.entity';
import { PositionEntity } from './position.entity';

@Entity({ name: 'contracts' })
export class ContractEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
    description: string;

    @Column({ name: 'contract_type', enum: CONTRACT_TYPE, unsigned: true, nullable: true })
    contractType: CONTRACT_TYPE;

    @Column({ name: 'signing_day', type: 'date', nullable: true })
    signingDay: Date;

    @Column({ name: 'start_day', type: 'date', nullable: true })
    startDay: Date;

    @Column({ name: 'end_day', type: 'date', nullable: true })
    endDay: Date;

    @Column({ type: 'enum', enum: CONTRACT_STATUS, default: CONTRACT_STATUS.ACTIVE })
    status: CONTRACT_STATUS;

    @Column({ name: 'result', enum: CONTRACT_RESULT, unsigned: true, nullable: true })
    result: CONTRACT_RESULT;

    @Column({ name: 'termination_day', type: 'date', nullable: true })
    terminationDay: Date;

    @Column({ name: 'staff_id', type: 'int', unsigned: true, nullable: true })
    staffId: number;

    @Column({ name: 'salary', type: 'varchar', length: 255, nullable: true })
    salary: string;

    @Column({ name: 'position_id', type: 'int', unsigned: true, nullable: true })
    positionId: number;

    /* RELATION */
    @ManyToOne(() => StaffEntity, (entity: StaffEntity) => entity.contracts, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'staff_id', referencedColumnName: 'id' })
    staff: Relation<StaffEntity>;

    @ManyToOne(() => PositionEntity, (entity: PositionEntity) => entity.contracts, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'position_id', referencedColumnName: 'id' })
    position: Relation<PositionEntity>;
}