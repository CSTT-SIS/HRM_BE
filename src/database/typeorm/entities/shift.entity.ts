import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { SHIFT_TYPE } from '~/common/enums/enum';
import { AbstractEntity } from './abstract.entity';
import { UserShiftEntity } from './userShift.entity';

@Entity({ name: 'shifts' })
export class ShiftEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 255 })
    name: string;

    @Column({ name: 'code', type: 'varchar', length: 50 })
    code: string;

    @Column({ type: 'enum', enum: SHIFT_TYPE, default: SHIFT_TYPE.TIME_RANGE })
    type: SHIFT_TYPE;

    @Column({ name: 'start_time', type: 'datetime', nullable: true })
    startTime: Date;

    @Column({ name: 'end_time', type: 'datetime', nullable: true })
    endTime: Date;

    @Column({ name: 'break_from', type: 'datetime', nullable: true })
    breakFrom: Date;

    @Column({ name: 'break_to', type: 'datetime', nullable: true })
    breakTo: Date;

    @Column({ name: 'wage_rate', type: 'int', nullable: true })
    wageRate: number;

    @Column({ name: 'total_hours', type: 'int' })
    totalHours: number;

    @Column({ name: 'note', type: 'varchar', length: 255, nullable: true })
    note: string;

    @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
    description: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    /* RELATION */
    @OneToMany(() => UserShiftEntity, (entity: UserShiftEntity) => entity.shift, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    userShifts: Relation<UserShiftEntity>[];
}
