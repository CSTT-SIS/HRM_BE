import { Controller, Get, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { DropdownService } from './dropdown.service';

@ApiTags('Dropdown')
@ApiBasicAuth('authorization')
@Controller('dropdown')
export class DropdownController {
    constructor(private readonly dropdownService: DropdownService) {}

    @Permission('warehouseType:findAll')
    @Get('warehouse-type')
    @ApiQuery({ type: FilterDto })
    warehouseType(@Query() queries) {
        return this.dropdownService.warehouseType({ ...queries });
    }

    @Permission('product:findAll')
    @Get('product')
    @ApiQuery({ type: FilterDto })
    product(@Query() queries) {
        return this.dropdownService.product({ ...queries });
    }

    @Permission('productCategory:findAll')
    @Get('product-category')
    @ApiQuery({ type: FilterDto })
    productCategory(@Query() queries) {
        return this.dropdownService.productCategory({ ...queries });
    }

    @Permission('unit:findAll')
    @Get('unit')
    @ApiQuery({ type: FilterDto })
    unit(@Query() queries) {
        return this.dropdownService.unit({ ...queries });
    }

    @Permission('provider:findAll')
    @Get('provider')
    @ApiQuery({ type: FilterDto })
    provider(@Query() queries) {
        return this.dropdownService.provider({ ...queries });
    }
}
