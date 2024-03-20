import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { ORDER_STATUS } from '~/common/enums/enum';
import { CreateOrderItemDto, CreateOrderItemsDto } from '~/modules/order/dto/create-order-item.dto';
import { UpdateOrderItemDto } from '~/modules/order/dto/update-order-item.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@ApiTags('Order')
@ApiBasicAuth('authorization')
@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Permission('order:create')
    @Post()
    create(@Body() createOrderDto: CreateOrderDto) {
        return this.orderService.create(createOrderDto);
    }

    @Permission('order:findAll')
    @Get()
    @ApiQuery({ name: 'warehouseId', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: ORDER_STATUS })
    findAll(
        @Query() queries: FilterDto,
        @Query('warehouseId', new ParseIntPipe({ optional: true })) warehouseId: string,
        @Query('status') status: string,
    ) {
        return this.orderService.findAll({ ...queries, warehouseId, status });
    }

    @Permission('order:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.orderService.findOne(+id);
    }

    @Permission('order:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateOrderDto: UpdateOrderDto) {
        return this.orderService.update(+id, updateOrderDto);
    }

    @Permission('order:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.orderService.remove(+id);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/head-approve')
    headApprove(@Param('id', ParseIntPipe) id: string) {
        return this.orderService.headApprove(+id);
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                comment: {
                    type: 'string',
                },
            },
        },
    })
    @Permission(BYPASS_PERMISSION)
    @Patch(':id/head-reject')
    headReject(@Param('id', ParseIntPipe) id: string, @Body() body: { comment: string }) {
        return this.orderService.headReject(+id, body?.comment);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/manager-approve')
    managerApprove(@Param('id', ParseIntPipe) id: string) {
        return this.orderService.managerApprove(+id);
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                comment: {
                    type: 'string',
                },
            },
        },
    })
    @Permission(BYPASS_PERMISSION)
    @Patch(':id/manager-reject')
    managerReject(@Param('id', ParseIntPipe) id: string, @Body() body: { comment: string }) {
        return this.orderService.managerReject(+id, body?.comment);
    }

    // @Permission('order:placeOrder')
    // @Patch(':id/place-order')
    // approve(@Param('id', ParseIntPipe) id: string) {
    //     return this.orderService.placeOrder(+id);
    // }

    // @Permission('order:cancel')
    // @Patch(':id/cancel')
    // cancelOrder(@Param('id', ParseIntPipe) id: string) {
    //     return this.orderService.cancel(+id);
    // }

    // @Permission('order:shipping')
    // @Patch(':id/shipping')
    // shipping(@Param('id', ParseIntPipe) id: string) {
    //     return this.orderService.shipping(+id);
    // }

    // @Permission('order:receive')
    // @Patch(':id/receive')
    // receive(@Param('id', ParseIntPipe) id: string) {
    //     return this.orderService.receive(+id);
    // }

    @Permission('order:getItems')
    @Get(':id/get-items')
    @ApiQuery({ name: 'productId', required: false })
    getDetails(
        @Param('id', ParseIntPipe) id: string,
        @Query() queries: FilterDto,
        @Query('productId', new ParseIntPipe({ optional: true })) productId: string,
    ) {
        return this.orderService.getItems({ ...queries, orderId: +id, productId });
    }

    @Permission('order:addItem')
    @Post(':id/add-item')
    addItem(@Param('id', ParseIntPipe) id: string, @Body() body: CreateOrderItemDto) {
        return this.orderService.addItem(+id, body);
    }

    @Permission('order:addItem')
    @Post(':id/add-items')
    addItems(@Param('id', ParseIntPipe) id: string, @Body() body: CreateOrderItemsDto) {
        return this.orderService.addItems(+id, body);
    }

    @Permission('order:updateItem')
    @Patch(':id/update-item/:itemId')
    updateItem(@Param('id', ParseIntPipe) id: string, @Param('itemId') itemId: string, @Body() body: UpdateOrderItemDto) {
        return this.orderService.updateItem(+id, +itemId, body);
    }

    @Permission('order:removeItem')
    @Delete(':id/remove-item/:itemId')
    removeItem(@Param('id', ParseIntPipe) id: string, @Param('itemId') itemId: string) {
        return this.orderService.removeItem(+id, +itemId);
    }
}
