import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { AccountEntity } from '~/database/typeorm/entities/account.entity';
import { RoleEntity } from '~/database/typeorm/entities/role.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';

export default class UserSeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const repository = dataSource.getRepository(UserEntity);
        const accountRepo = dataSource.getRepository(AccountEntity);
        const roleRepo = dataSource.getRepository(RoleEntity);
        const account = await accountRepo.findOneBy({ username: 'admin' });
        const role = await roleRepo.findOneBy({ name: 'Admin' });
        if (!(await repository.countBy({ accountId: account?.id, roleId: role?.id }))) {
            await repository.insert([
                {
                    accountId: account?.id,
                    roleId: role?.id,
                    fullName: 'Admin',
                    email: 'admin@rsrm.dev',
                },
            ]);
        }
    }
}
