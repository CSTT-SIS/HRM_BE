import { setSeederFactory } from 'typeorm-extension';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';

export default setSeederFactory(ProductEntity, (faker) => {
    const entity = new ProductEntity();

    entity.name = faker.commerce.productName();
    entity.code = entity.name
        .match(/\b(\w+)\b/g)
        .join('')
        .toUpperCase();
    entity.description = faker.commerce.productDescription();
    entity.categoryId = faker.number.int({ min: 1, max: 10 });

    return entity;
});
