import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { AccountEntity } from '../entities/account.entity';

export default class AccountSeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const repository = dataSource.getRepository(AccountEntity);
        if (!(await repository.countBy({ username: 'admin' }))) {
            await repository.insert([
                {
                    username: 'admin',
                    password: '$2b$08$NurMoRDe0qIYY1SL8EQFT.WUTbCf8u2gk7imco2XFlapibRscC2v.',
                    salt: '$2b$08$NurMoRDe0qIYY1SL8EQFT.',
                    isActive: true,
                },
            ]);
        }

        const accountFactory = factoryManager.get(AccountEntity);
        const userFactory = factoryManager.get(UserEntity);
        // save 1 factory generated entity, to the database
        const account = await accountFactory.save();
        await userFactory.save({ accountId: account.id });
    }
}
