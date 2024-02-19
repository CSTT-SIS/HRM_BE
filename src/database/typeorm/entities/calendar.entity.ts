import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { CALENDAR_TYPE } from '~/common/enums/enum';
import { DepartmentEntity } from '~/database/typeorm/entities/department.entity';

@Entity({ name: 'calendars' })
export class CalendarEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'content', type: 'varchar', length: 255, nullable: true })
    content: string;

    @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
    description: string;

    @Column({ name: 'time', type: 'datetime', nullable: true })
    time: Date;

    @Column({ type: 'enum', enum: CALENDAR_TYPE, default: CALENDAR_TYPE.GENERAL })
    type: CALENDAR_TYPE;

    @Column({ name: 'department_id', type: 'int', unsigned: true, nullable: true })
    departmentId: number;

    /* RELATION */
    @ManyToOne(() => DepartmentEntity, (entity: DepartmentEntity) => entity.calendars, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'department_id', referencedColumnName: 'id' })
    department: Relation<DepartmentEntity>;
}
