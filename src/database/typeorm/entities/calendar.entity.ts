import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { CalendarUserEntity } from './calendarUser.entity';
import { LEVEL_CALENDAR } from '~/common/enums/enum';

@Entity({ name: 'calendars' })
export class CalendarEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
    title: string;

    @Column({ name: 'description', type: 'varchar', length: 1000, nullable: true })
    description: string;

    @Column({ name: 'start_date', type: 'datetime', nullable: true })
    startDate: Date;

    @Column({ name: 'end_date', type: 'datetime', nullable: true })
    endDate: Date;

    @Column({ type: 'enum', enum: LEVEL_CALENDAR, default: LEVEL_CALENDAR.LESS_IMPORTANT })
    level: LEVEL_CALENDAR;

    @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true })
    createdBy: number;

    @Column({ name: 'updated_by', type: 'int', unsigned: true, nullable: true })
    updatedBy: number;

    /* RELATION */
    @OneToMany(() => CalendarUserEntity, (entity: CalendarUserEntity) => entity.calendar, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    calendarUsers: Relation<CalendarUserEntity>;
}
