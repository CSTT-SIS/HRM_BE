import { setSeederFactory } from 'typeorm-extension';
import { ProductCategoryEntity } from '~/database/typeorm/entities/productCategory.entity';

export default setSeederFactory(ProductCategoryEntity, (faker) => {
    const entity = new ProductCategoryEntity();

    entity.name = faker.commerce.department();
    entity.description = faker.commerce.productDescription();

    return entity;
});
