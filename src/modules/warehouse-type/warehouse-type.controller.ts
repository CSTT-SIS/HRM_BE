import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateWarehouseTypeDto } from './dto/create-warehouse-type.dto';
import { UpdateWarehouseTypeDto } from './dto/update-warehouse-type.dto';
import { WarehouseTypeService } from './warehouse-type.service';

@ApiTags('Warehouse Type')
@ApiBasicAuth('authorization')
@Controller('warehouse-type')
export class WarehouseTypeController {
    constructor(private readonly warehouseTypeService: WarehouseTypeService) {}

    @Permission('warehouseType:create')
    @Post()
    createType(@Body() createWarehouseTypeDto: CreateWarehouseTypeDto) {
        return this.warehouseTypeService.create(createWarehouseTypeDto);
    }

    @Permission('warehouseType:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAllType(@Query() queries) {
        return this.warehouseTypeService.findAll({ ...queries });
    }

    @Permission('warehouseType:findOne')
    @Get(':id')
    findOneType(@Param('id') id: string) {
        return this.warehouseTypeService.findOne(+id);
    }

    @Permission('warehouseType:update')
    @Patch(':id')
    updateType(@Param('id') id: string, @Body() updateWarehouseTypeDto: UpdateWarehouseTypeDto) {
        return this.warehouseTypeService.update(+id, updateWarehouseTypeDto);
    }

    @Permission('warehouseType:remove')
    @Delete(':id')
    removeType(@Param('id') id: string) {
        return this.warehouseTypeService.remove(+id);
    }
}
