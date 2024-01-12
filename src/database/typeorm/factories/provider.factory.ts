import { setSeederFactory } from 'typeorm-extension';
import { ProviderEntity } from '~/database/typeorm/entities/provider.entity';

export default setSeederFactory(ProviderEntity, (faker) => {
    const entity = new ProviderEntity();

    entity.name = faker.company.name();
    entity.address = faker.location.streetAddress();
    entity.phone = faker.phone.number();
    entity.email = faker.internet.email();

    return entity;
});
