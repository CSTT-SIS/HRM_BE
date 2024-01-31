import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { PROPOSAL_STATUS, PROPOSAL_TYPE } from '~/common/enums/enum';
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
    @ApiQuery({ name: 'categoryId', required: false, type: Number })
    product(@Query() queries, @Query('categoryId', new ParseIntPipe({ optional: true })) categoryId: string) {
        return this.dropdownService.product({ ...queries, categoryId });
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

    @Permission('proposal:findAll')
    @Get('proposal')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'type', enum: PROPOSAL_TYPE, required: false })
    @ApiQuery({ name: 'status', enum: PROPOSAL_STATUS, required: false })
    proposal(@Query() queries, @Query('type') type: string, @Query('status') status: string) {
        return this.dropdownService.proposal({ ...queries, type, status });
    }

    @Permission('proposal:findAll')
    @Get('proposal-type')
    proposalType() {
        return this.dropdownService.proposalType();
    }

    @Permission('warehouse:findAll')
    @Get('warehouse')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'typeId', required: false, type: Number })
    warehouse(@Query() queries, @Query('typeId', new ParseIntPipe({ optional: true })) typeId: string) {
        return this.dropdownService.warehouse({ ...queries, typeId });
    }

    @Permission('order:findAll')
    @Get('order')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'proposalId', required: false, type: Number })
    @ApiQuery({ name: 'providerId', required: false, type: Number })
    order(
        @Query() queries,
        @Query('proposalId', new ParseIntPipe({ optional: true })) proposalId: string,
        @Query('providerId', new ParseIntPipe({ optional: true })) providerId: string,
    ) {
        return this.dropdownService.order({ ...queries, proposalId, providerId });
    }

    @Permission('order:findAll')
    @Get('order-type')
    orderType() {
        return this.dropdownService.orderType();
    }
}
