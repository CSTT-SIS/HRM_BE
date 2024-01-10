import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'product_categories' })
export class ProductCategoryEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
    name: string;

    @Column({ name: 'description', type: 'varchar', length: 500, nullable: false })
    description: string;

    /* RELATIONS */
    @OneToMany(() => ProductEntity, (product) => product.category, { createForeignKeyConstraints: false })
    products: Relation<ProductEntity>[];
}
