import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { USER_STATUS } from '~/common/enums/enum';
import { AbstractEntity } from '~/database/typeorm/entities/abstract.entity';
import { AccountEntity } from '~/database/typeorm/entities/account.entity';
import { DepartmentEntity } from '~/database/typeorm/entities/department.entity';
import { MediaEntity } from '~/database/typeorm/entities/media.entity';
import { RoleEntity } from '~/database/typeorm/entities/role.entity';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'account_id', type: 'int', unsigned: true })
    accountId: number;

    @Column({ name: 'role_id', type: 'int', unsigned: true, nullable: true })
    roleId: number;

    @Column({ name: 'media_id', type: 'int', unsigned: true, nullable: true })
    avatarId: number;

    @Index('IDX_FULL_NAME', { fulltext: true })
    @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
    fullName: string;

    @Index('IDX_USER_EMAIL', { fulltext: true })
    @Column({ name: 'email', type: 'varchar', length: 255, nullable: true, unique: true })
    email: string;

    @Column({ name: 'area_code', type: 'varchar', length: 5, nullable: true })
    areaCode: string;

    @Column({ name: 'phone', type: 'varchar', length: 15, nullable: true })
    phone: string;

    @Column({ name: 'birthday', type: 'varchar', length: 255, nullable: true })
    birthday: string;

    @Column({ name: 'address', type: 'varchar', length: 500, nullable: true })
    address: string;

    @Column({ name: 'gender', type: 'varchar', length: 10, nullable: true })
    gender: string;

    @Column({ type: 'enum', enum: USER_STATUS, default: USER_STATUS.ACTIVE })
    status: USER_STATUS;

    @Column({ name: 'department_id', type: 'int', unsigned: true, nullable: true })
    departmentId: number;

    /* RELATION */
    @OneToOne(() => AccountEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
    account: Relation<AccountEntity>;

    @ManyToOne(() => RoleEntity, (role: RoleEntity) => role.id, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
    role: Relation<RoleEntity>;

    @ManyToOne(() => MediaEntity, (entity: MediaEntity) => entity.users, {
        nullable: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'media_id', referencedColumnName: 'id' })
    avatar: Relation<MediaEntity>;

    @ManyToOne(() => DepartmentEntity, (entity: DepartmentEntity) => entity.users, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'department_id', referencedColumnName: 'id' })
    department: Relation<DepartmentEntity>;
}
