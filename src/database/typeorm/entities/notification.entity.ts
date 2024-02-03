import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'notifications' })
export class NotificationEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
    title: string;

    @Column({ name: 'content', type: 'text', nullable: true })
    content: string;

    @Column({ name: 'type', type: 'varchar', length: 255, nullable: true })
    type: string;

    @Column({ name: 'is_read', type: 'tinyint', default: 0, nullable: true })
    isRead: boolean;

    @Column({ name: 'receiver_id', type: 'int', unsigned: true, nullable: true })
    receiverId: number;

    @Column({ name: 'sender_id', type: 'int', unsigned: true, nullable: true })
    senderId: number;

    @Column({ name: 'link', type: 'text', nullable: true })
    link: string;

    /* RELATIONS */
    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'receiver_id', referencedColumnName: 'id' })
    receiver: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
    sender: Relation<UserEntity>;
}
