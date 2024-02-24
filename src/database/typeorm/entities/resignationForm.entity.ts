import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { RESIGNATION_STATUS } from '~/common/enums/enum';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'resignation_forms' })
export class ResignationFormEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'time', type: 'date', nullable: true })
    time: Date;

    @Column({ type: 'enum', enum: RESIGNATION_STATUS, default: RESIGNATION_STATUS.PENDING })
    status: RESIGNATION_STATUS;

    @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
    userId: number;

    @Column({ name: 'approved_by', type: 'int', unsigned: true, nullable: true })
    approvedBy: number;

    /* RELATION */
    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.resignationForms, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.approvedResignationForms, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'approved_by', referencedColumnName: 'id' })
    approvedByUser: Relation<UserEntity>;
}
