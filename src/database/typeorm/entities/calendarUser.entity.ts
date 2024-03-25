import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { CalendarEntity } from './calendar.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'calendar_users' })
export class CalendarUserEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'calendar_id', type: 'int', unsigned: true, nullable: true })
    calendarId: number;

    @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
    userId: number;

    @OneToOne(() => CalendarEntity, (entity: CalendarEntity) => entity.calendarUsers, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'calendar_id', referencedColumnName: 'id' })
    calendar: Relation<CalendarEntity>;

    @OneToOne(() => UserEntity, (entity: UserEntity) => entity.calendarUsers, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Relation<UserEntity>;
}
