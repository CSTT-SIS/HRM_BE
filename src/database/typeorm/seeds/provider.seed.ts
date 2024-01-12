import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { ProviderEntity } from '~/database/typeorm/entities/provider.entity';

export default class ProviderSeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const factory = factoryManager.get(ProviderEntity);
        await factory.saveMany(10);
    }
}
