import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { HOLIDAY_TYPE } from '~/common/enums/enum';

@Entity({ name: 'holidays' })
export class HolidayEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'holiday_type', type: 'enum', enum: HOLIDAY_TYPE, nullable: true })
    holidayType: HOLIDAY_TYPE;

    @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
    description: string;

    @Column({ name: 'start_day', type: 'date', nullable: true })
    startDay: Date;

    @Column({ name: 'end_day', type: 'date', nullable: true })
    endDay: Date;
}
