import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';
import { WarehouseTypeEntity } from '~/database/typeorm/entities/warehouseType.entity';

export default class WarehouseSeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const warehouseTypeFactory = factoryManager.get(WarehouseTypeEntity);
        await warehouseTypeFactory.saveMany(5);

        const warehouseFactory = factoryManager.get(WarehouseEntity);
        await warehouseFactory.saveMany(5);
    }
}
