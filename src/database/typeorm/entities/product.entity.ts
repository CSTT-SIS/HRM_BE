import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { MediaEntity } from '~/database/typeorm/entities/media.entity';
import { ProductCategoryEntity } from '~/database/typeorm/entities/productCategory.entity';
import { ProviderEntity } from '~/database/typeorm/entities/provider.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'products' })
export class ProductEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'category_id', type: 'int', unsigned: true, nullable: true })
    categoryId: number;

    @Column({ name: 'provider_id', type: 'int', unsigned: true, nullable: true })
    providerId: number;

    @Column({ name: 'media_id', type: 'int', unsigned: true, nullable: true })
    mediaId: number;

    @Index('IDX_PRODUCT_NAME', { fulltext: true })
    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Index('IDX_PRODUCT_CODE', { fulltext: true })
    @Column({ name: 'code', type: 'varchar', length: 255, nullable: true })
    code: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @Column({ name: 'price', type: 'decimal', precision: 10, scale: 0, nullable: true })
    price: number;

    @Column({ name: 'tax', type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
    tax: number;

    /* RELATIONS */
    @ManyToOne(() => ProductCategoryEntity, (category) => category.products, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
    category: Relation<ProductCategoryEntity>;

    @ManyToOne(() => ProviderEntity, (provider) => provider.products, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'provider_id', referencedColumnName: 'id' })
    provider: Relation<ProviderEntity>;

    @ManyToOne(() => MediaEntity, (media) => media.products, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'media_id', referencedColumnName: 'id' })
    media: Relation<MediaEntity>;
}
