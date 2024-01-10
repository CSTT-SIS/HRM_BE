import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'providers' })
export class ProviderEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Index('IDX_PROVIDER_NAME', { fulltext: true })
    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'address', type: 'varchar', length: 255, nullable: true })
    address: string;

    @Column({ name: 'phone', type: 'varchar', length: 255, nullable: true })
    phone: string;

    @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
    email: string;

    @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
    description: string;
}
