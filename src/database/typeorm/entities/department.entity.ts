import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from '~/database/typeorm/entities/abstract.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';

@Entity({ name: 'departments' })
export class DepartmentEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Index('IDX_DEPARTMENT_NAME', { fulltext: true })
    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
    description: string;

    /* RELATIONS */
    @OneToMany(() => UserEntity, (entity: UserEntity) => entity.department, { createForeignKeyConstraints: false })
    users: Relation<UserEntity>[];
}
