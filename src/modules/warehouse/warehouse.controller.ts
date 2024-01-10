import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateWarehouseTypeDto } from '~/modules/warehouse/dto/create-warehouse-type.dto';
import { UpdateWarehouseTypeDto } from '~/modules/warehouse/dto/update-warehouse-type.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseService } from './warehouse.service';

@ApiTags('Warehouse')
@ApiBasicAuth('authorization')
@Controller('warehouse')
export class WarehouseController {
    constructor(private readonly warehouseService: WarehouseService) {}

    @Permission('warehouse-type:create')
    @Post('type')
    createType(@Body() createWarehouseTypeDto: CreateWarehouseTypeDto) {
        return this.warehouseService.createType(createWarehouseTypeDto);
    }

    @Permission('warehouse:create')
    @Post()
    create(@Body() createWarehouseDto: CreateWarehouseDto) {
        return this.warehouseService.create(createWarehouseDto);
    }

    @Permission('warehouse-type:findAll')
    @Get('type')
    @ApiQuery({ type: FilterDto })
    findAllType(@Query() queries) {
        return this.warehouseService.findAllType({ ...queries });
    }

    @Permission('warehouse:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'typeId', required: false })
    findAll(@Query() queries, @Query('typeId') typeId: number) {
        return this.warehouseService.findAll({ ...queries, typeId });
    }

    @Permission('warehouse-type:findOne')
    @Get('type/:id')
    findOneType(@Param('id') id: string) {
        return this.warehouseService.findOneType(+id);
    }

    @Permission('warehouse:findOne')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.warehouseService.findOne(+id);
    }

    @Permission('warehouse-type:update')
    @Patch('type/:id')
    updateType(@Param('id') id: string, @Body() updateWarehouseTypeDto: UpdateWarehouseTypeDto) {
        return this.warehouseService.updateType(+id, updateWarehouseTypeDto);
    }

    @Permission('warehouse:update')
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateWarehouseDto: UpdateWarehouseDto) {
        return this.warehouseService.update(+id, updateWarehouseDto);
    }

    @Permission('warehouse-type:remove')
    @Delete('type/:id')
    removeType(@Param('id') id: string) {
        return this.warehouseService.removeType(+id);
    }

    @Permission('warehouse:remove')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.warehouseService.remove(+id);
    }
}
