import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { TASK_PRIORITY } from '~/common/enums/enum';
import { AbstractEntity } from './abstract.entity';
import { DepartmentTaskEntity } from './departmentTask.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'tasks' })
export class TaskEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'description', type: 'varchar', length: 1000, nullable: true })
    description: string;

    @Column({ name: 'priority', type: 'varchar', length: 255, nullable: true })
    priority: TASK_PRIORITY;

    @Column({ name: 'due_date', type: 'date', nullable: true })
    dueDate: Date;

    @Column({ name: 'assignee_id', type: 'int', unsigned: true, nullable: true })
    assigneeId: number;

    @Column({ name: 'creator_id', type: 'int', unsigned: true, nullable: true })
    creatorId: number;

    @Column({ name: 'coordinator_id', type: 'int', unsigned: true, nullable: true })
    coordinatorId: number;

    @Column({ name: 'start_date', type: 'date', nullable: true })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    endDate: Date;

    @Column({ name: 'comments', type: 'varchar', length: 1000, nullable: true })
    comments: string;

    /* RELATION */
    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.assignedTasks, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'assignee_id', referencedColumnName: 'id' })
    assignee: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.createdTasks, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'creator_id', referencedColumnName: 'id' })
    creator: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.coordinatedTasks, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'coordinator_id', referencedColumnName: 'id' })
    coordinator: Relation<UserEntity>;

    @OneToMany(() => DepartmentTaskEntity, (entity: DepartmentTaskEntity) => entity.task, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    departmentTasks: Relation<DepartmentTaskEntity>[];
}
