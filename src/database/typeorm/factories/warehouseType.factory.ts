import { setSeederFactory } from 'typeorm-extension';
import { WarehouseTypeEntity } from '~/database/typeorm/entities/warehouseType.entity';

export default setSeederFactory(WarehouseTypeEntity, (faker) => {
    const entity = new WarehouseTypeEntity();

    entity.name = faker.commerce.department();
    entity.description = faker.commerce.productDescription();

    return entity;
});
