import { Module } from '@nestjs/common';
import { TallyingCompletedListener } from './listeners/tallying-completed.listener';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';

@Module({
    controllers: [WarehouseController],
    providers: [WarehouseService, TallyingCompletedListener],
})
export class WarehouseModule {}
