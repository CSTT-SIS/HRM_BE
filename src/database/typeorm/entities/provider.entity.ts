import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
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

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    /* RELATIONS */
    @OneToMany(() => ProductEntity, (product) => product.provider, { createForeignKeyConstraints: false })
    products: Relation<ProductEntity>[];
}
