import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { MEDIA_TYPE } from '~/common/enums/enum';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'medias' })
export class MediaEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'type', type: 'enum', enum: MEDIA_TYPE })
    type: MEDIA_TYPE;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
    name: string;

    @Column({ name: 'path', type: 'varchar', length: 500, nullable: false })
    path: string;

    /* RELATION */
    @OneToMany(() => UserEntity, (entity: UserEntity) => entity.avatar, { createForeignKeyConstraints: false })
    users: Relation<UserEntity>[];
}
