import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { WAREHOUSING_BILL_STATUS, WAREHOUSING_BILL_TYPE } from '~/common/enums/enum';
import { CreateWarehousingBillDto } from './dto/create-warehousing-bill.dto';
import { UpdateWarehousingBillDto } from './dto/update-warehousing-bill.dto';
import { WarehousingBillService } from './warehousing-bill.service';

@ApiTags('Warehousing Bill')
@ApiBasicAuth('authorization')
@Controller('warehousing-bill')
export class WarehousingBillController {
    constructor(private readonly warehousingBillService: WarehousingBillService) {}

    @Permission('warehousingBill:create')
    @Post()
    create(@Body() createWarehousingBillDto: CreateWarehousingBillDto) {
        return this.warehousingBillService.create(createWarehousingBillDto);
    }

    @Permission('warehousingBill:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'proposalId', required: false, type: Number })
    @ApiQuery({ name: 'warehouseId', required: false, type: Number })
    @ApiQuery({ name: 'orderId', required: false, type: Number })
    @ApiQuery({ name: 'type', enum: WAREHOUSING_BILL_TYPE, required: false })
    @ApiQuery({ name: 'status', enum: WAREHOUSING_BILL_STATUS, required: false })
    findAll(
        @Query() queries,
        @Query('proposalId', new ParseIntPipe({ optional: true })) proposalId: string,
        @Query('warehouseId', new ParseIntPipe({ optional: true })) warehouseId: string,
        @Query('orderId', new ParseIntPipe({ optional: true })) orderId: string,
        @Query('type') type: string,
        @Query('status') status: string,
    ) {
        return this.warehousingBillService.findAll({ ...queries, proposalId, warehouseId, orderId, type, status });
    }

    @Permission('warehousingBill:create')
    @Get('approved-requests')
    @ApiQuery({ name: 'id', required: false, type: Number })
    @ApiQuery({ name: 'entity', required: false, type: String })
    @ApiQuery({ name: 'search', required: false, type: String })
    approvedRequests(
        @Query('id', new ParseIntPipe({ optional: true })) id: string,
        @Query('entity') entity: string,
        @Query('search') search: string,
    ) {
        return this.warehousingBillService.getApprovedRequests({ id: +id, entity, search });
    }

    @Permission('warehousingBill:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.warehousingBillService.findOne(+id);
    }

    @Permission('warehousingBill:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateWarehousingBillDto: UpdateWarehousingBillDto) {
        return this.warehousingBillService.update(+id, updateWarehousingBillDto);
    }

    @Permission('warehousingBill:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.warehousingBillService.remove(+id);
    }

    @Permission('warehousingBill:getDetails')
    @Get(':id/details')
    @ApiQuery({ name: 'productId', required: false })
    getDetails(
        @Param('id', ParseIntPipe) id: string,
        @Query() queries: FilterDto,
        @Query('productId', new ParseIntPipe({ optional: true })) productId: string,
    ) {
        return this.warehousingBillService.getDetails({ ...queries, warehousingBillId: +id, productId });
    }

    // @Permission('warehousingBill:approve')
    // @Patch(':id/approve')
    // approve(@Param('id', ParseIntPipe) id: string) {
    //     return this.warehousingBillService.approve(+id);
    // }

    // @Permission('warehousingBill:reject')
    // @Patch(':id/reject')
    // reject(@Param('id', ParseIntPipe) id: string) {
    //     return this.warehousingBillService.reject(+id);
    // }

    @Permission('warehousingBill:finish')
    @Patch(':id/finish')
    finish(@Param('id', ParseIntPipe) id: string) {
        return this.warehousingBillService.finish(+id);
    }

    @Permission('warehousingBill:tally')
    @Patch(':id/tally/:detailId')
    @ApiQuery({ name: 'quantity', required: true, type: Number })
    tally(
        @Param('id', ParseIntPipe) id: string,
        @Param('detailId', ParseIntPipe) detailId: string,
        @Query('quantity', new ParseIntPipe({ optional: true })) quantity: string,
    ) {
        return this.warehousingBillService.tally(+id, +detailId, +quantity);
    }
}
