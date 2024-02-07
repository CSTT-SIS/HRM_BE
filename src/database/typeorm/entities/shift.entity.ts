import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { SHIFT_TYPE } from '~/common/enums/enum';
import { AbstractEntity } from './abstract.entity';
import { StaffShiftEntity } from './staffShift.entity';

@Entity({ name: 'shifts' })
export class ShiftEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'time', type: 'varchar', length: 255, nullable: true })
    time: string;

    @Column({ name: 'day', type: 'date', nullable: true })
    day: Date;

    @Column({ name: 'start_date', type: 'datetime', nullable: true })
    startDate: Date;

    @Column({ name: 'end_date', type: 'datetime', nullable: true })
    endDate: Date;

    @Column({ type: 'enum', enum: SHIFT_TYPE, default: SHIFT_TYPE.MORNING })
    type: SHIFT_TYPE;

    /* RELATION */
    @OneToMany(() => StaffShiftEntity, (entity: StaffShiftEntity) => entity.shift, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    staffShifts: Relation<StaffShiftEntity>[];
}
