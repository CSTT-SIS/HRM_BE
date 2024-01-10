import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { AccountEntity } from '~/database/typeorm/entities/account.entity';
import { RoleEntity } from '~/database/typeorm/entities/role.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';

export default class UserSeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const accountRepo = dataSource.getRepository(AccountEntity);
        if (!(await accountRepo.countBy({ username: 'admin' }))) {
            const admin = await accountRepo.save([
                {
                    username: 'admin',
                    password: '$2b$08$NurMoRDe0qIYY1SL8EQFT.WUTbCf8u2gk7imco2XFlapibRscC2v.',
                    salt: '$2b$08$NurMoRDe0qIYY1SL8EQFT.',
                    isActive: true,
                },
            ]);

            const userRepo = dataSource.getRepository(UserEntity);
            const roleRepo = dataSource.getRepository(RoleEntity);
            const role = await roleRepo.findOneBy({ name: 'Admin' });
            if (!(await userRepo.countBy({ accountId: admin[0].id, roleId: role?.id }))) {
                await userRepo.insert([
                    {
                        accountId: admin[0].id,
                        roleId: role?.id,
                        fullName: 'Admin',
                        email: 'admin@rsrm.dev',
                    },
                ]);
            }
        }

        const accountFactory = factoryManager.get(AccountEntity);
        const userFactory = factoryManager.get(UserEntity);
        // save 1 factory generated entity, to the database
        const account = await accountFactory.save();
        await userFactory.save({ accountId: account.id });
    }
}
