import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { StaffEntity } from './staff.entity';
import { ShiftEntity } from './shift.entity';

@Entity({ name: 'staff_shifts' })
export class StaffShiftEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'staff_id', type: 'int', unsigned: true, nullable: true })
    staffId: number;

    @Column({ name: 'shift_id', type: 'int', unsigned: true, nullable: true })
    shiftId: number;

    /* RELATION */
    @ManyToOne(() => StaffEntity, (entity: StaffEntity) => entity.staffShifts, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'staff_id', referencedColumnName: 'id' })
    staff: Relation<StaffEntity>;

    @ManyToOne(() => ShiftEntity, (entity: ShiftEntity) => entity.staffShifts, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'shift_id', referencedColumnName: 'id' })
    shift: Relation<ShiftEntity>;
}
