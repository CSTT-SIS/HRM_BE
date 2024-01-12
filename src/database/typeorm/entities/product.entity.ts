import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';
import { MediaEntity } from '~/database/typeorm/entities/media.entity';
import { ProductCategoryEntity } from '~/database/typeorm/entities/productCategory.entity';
import { ProviderEntity } from '~/database/typeorm/entities/provider.entity';
import { QuantityLimitEntity } from '~/database/typeorm/entities/quantityLimit.entity';
import { ColumnNumericTransformer } from '~/database/typeorm/entities/transformer.entity';
import { UnitEntity } from '~/database/typeorm/entities/unit.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'products' })
export class ProductEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'category_id', type: 'int', unsigned: true, nullable: true })
    categoryId: number;

    @Column({ name: 'provider_id', type: 'int', unsigned: true, nullable: true })
    providerId: number;

    @Column({ name: 'unit_id', type: 'int', unsigned: true, nullable: true })
    unitId: number;

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

    @Column({ name: 'price', type: 'decimal', precision: 10, scale: 0, nullable: true, transformer: new ColumnNumericTransformer() })
    price: number;

    @Column({ name: 'tax', type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0, transformer: new ColumnNumericTransformer() })
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

    @OneToMany(() => InventoryEntity, (inventory) => inventory.product, { createForeignKeyConstraints: false })
    inventories: Relation<InventoryEntity>[];

    @OneToOne(() => QuantityLimitEntity, (quantityLimit) => quantityLimit.product, { createForeignKeyConstraints: false })
    quantityLimit: Relation<QuantityLimitEntity>;

    @ManyToOne(() => UnitEntity, (unit) => unit.products, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'unit_id', referencedColumnName: 'id' })
    unit: Relation<UnitEntity>;
}
