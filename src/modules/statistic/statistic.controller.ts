import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { WAREHOUSING_BILL_TYPE } from '~/common/enums/enum';
import { StatisticService } from './statistic.service';

@ApiTags('Statistic')
@ApiBasicAuth('authorization')
@Controller('statistic')
export class StatisticController {
    constructor(private readonly statisticService: StatisticService) {}

    @Permission('statistic:productCategory')
    @Get('product-categories')
    productCategory() {
        return this.statisticService.productCategory();
    }

    @Permission('statistic:warehouse')
    @Get('warehouses')
    warehouse() {
        return this.statisticService.warehouse();
    }

    @Permission('statistic:order')
    @Get('orders/type')
    orderType() {
        return this.statisticService.orderType();
    }

    @Permission('statistic:order')
    @Get('orders/status')
    orderStatus() {
        return this.statisticService.orderStatus();
    }

    @Permission('statistic:repairRequest')
    @Get('repair-requests/status')
    repairRequestStatus() {
        return this.statisticService.repairRequestStatus();
    }

    @Permission('statistic:proposal')
    @Get('proposals/type')
    proposalType() {
        return this.statisticService.proposalType();
    }

    @Permission('statistic:proposal')
    @Get('proposals/status')
    proposalStatus() {
        return this.statisticService.proposalStatus();
    }

    @Permission('statistic:warehousingBill')
    @Get('warehousing-bills/type')
    @ApiQuery({ name: 'type', required: false, enum: WAREHOUSING_BILL_TYPE })
    warehousingBillType(@Query('type') type?: string) {
        return this.statisticService.warehousingBillType(type);
    }

    @Permission('statistic:warehousingBill')
    @Get('warehousing-bills/status')
    @ApiQuery({ name: 'type', required: false, enum: WAREHOUSING_BILL_TYPE })
    warehousingBillStatus(@Query('type') type?: string) {
        return this.statisticService.warehousingBillStatus(type);
    }

    @Permission('statistic:product')
    @Get('products/inventory')
    @ApiQuery({ name: 'warehouseId', required: false, type: Number })
    product(@Query('warehouseId', new ParseIntPipe({ optional: true })) warehouseId?: string) {
        return this.statisticService.product(warehouseId);
    }

    @Permission('statistic:product')
    @Get('products/inventory/expired')
    @ApiQuery({ type: FilterDto })
    expiredProduct(@Query() queries) {
        return this.statisticService.expiredProduct({ ...queries });
    }
}
