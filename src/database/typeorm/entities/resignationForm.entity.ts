import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { RESIGNATION_STATUS } from '~/common/enums/enum';
import { AbstractEntity } from './abstract.entity';
import { StaffEntity } from './staff.entity';

@Entity({ name: 'resignation_forms' })
export class ResignationFormEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'time', type: 'date', nullable: true })
    time: Date;

    @Column({ type: 'enum', enum: RESIGNATION_STATUS, default: RESIGNATION_STATUS.PENDING })
    status: RESIGNATION_STATUS;

    @Column({ name: 'staff_id', type: 'int', unsigned: true, nullable: true })
    staffId: number;

    @Column({ name: 'approved_by', type: 'int', unsigned: true, nullable: true })
    approvedBy: number;

    /* RELATION */
    @ManyToOne(() => StaffEntity, (entity: StaffEntity) => entity.resignationForms, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'staff_id', referencedColumnName: 'id' })
    staff: Relation<StaffEntity>;

    @ManyToOne(() => StaffEntity, (entity: StaffEntity) => entity.approvedResignationForms, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'approved_by', referencedColumnName: 'id' })
    approvedByStaff: Relation<StaffEntity>;
}
