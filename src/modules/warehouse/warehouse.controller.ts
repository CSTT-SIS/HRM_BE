import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { ImportGoodDto } from '~/modules/warehouse/dto/import-good.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseService } from './warehouse.service';

@ApiTags('Warehouse')
@ApiBasicAuth('authorization')
@Controller('warehouse')
export class WarehouseController {
    constructor(private readonly warehouseService: WarehouseService) {}

    @Permission('warehouse:create')
    @Post()
    create(@Body() createWarehouseDto: CreateWarehouseDto) {
        return this.warehouseService.create(createWarehouseDto);
    }

    @Permission('warehouse:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'typeId', required: false })
    findAll(@Query() queries, @Query('typeId') typeId: number) {
        return this.warehouseService.findAll({ ...queries, typeId });
    }

    @Permission('warehouse:findOne')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.warehouseService.findOne(+id);
    }

    @Permission('warehouse:update')
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateWarehouseDto: UpdateWarehouseDto) {
        return this.warehouseService.update(+id, updateWarehouseDto);
    }

    @Permission('warehouse:remove')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.warehouseService.remove(+id);
    }
    @Permission('warehouse:get-products')
    @Get(':id/products')
    @ApiQuery({ type: FilterDto })
    getProducts(@Param('id') id: string, @Query() queries) {
        return this.warehouseService.getProducts({ ...queries, warehouseId: +id });
    }

    @Permission('warehouse:import')
    @Post(':id/import')
    import(@Param('id') id: string, @Body() importGoodDto: ImportGoodDto) {
        return this.warehouseService.importGoods(+id, importGoodDto);
    }
}
