import moment from 'moment';
import { setSeederFactory } from 'typeorm-extension';
import { UserEntity } from '~/database/typeorm/entities/user.entity';

export default setSeederFactory(UserEntity, (faker) => {
    const entity = new UserEntity();

    entity.fullName = faker.person.fullName();
    entity.email = faker.internet.email();
    entity.phone = faker.string.numeric(9);
    entity.address = faker.location.streetAddress();
    entity.birthday = moment(faker.date.past({ years: 20 })).format('YYYY-MM-DD');
    entity.areaCode = faker.string.numeric(2);
    entity.gender = faker.person.sex();

    return entity;
});
