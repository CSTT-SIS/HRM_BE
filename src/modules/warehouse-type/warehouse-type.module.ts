import { Module } from '@nestjs/common';
import { WarehouseTypeService } from './warehouse-type.service';
import { WarehouseTypeController } from './warehouse-type.controller';

@Module({
  controllers: [WarehouseTypeController],
  providers: [WarehouseTypeService],
})
export class WarehouseTypeModule {}
