import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateStocktakeDetailDto } from '~/modules/stocktake/dto/create-stocktake-detail.dto';
import { TallyStocktakeDetailDto } from '~/modules/stocktake/dto/tally-stocktake-detail.dto';
import { UpdateStocktakeDetailDto } from '~/modules/stocktake/dto/update-stocktake-detail.dto';
import { CreateStocktakeDto } from './dto/create-stocktake.dto';
import { UpdateStocktakeDto } from './dto/update-stocktake.dto';
import { StocktakeService } from './stocktake.service';

@ApiTags('Stocktake')
@ApiBasicAuth('authorization')
@Controller('stocktake')
export class StocktakeController {
    constructor(private readonly stocktakeService: StocktakeService) {}

    @Permission('stocktake:create')
    @Post()
    create(@Body() createStocktakeDto: CreateStocktakeDto) {
        return this.stocktakeService.create(createStocktakeDto);
    }

    @Permission('stocktake:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.stocktakeService.findAll({ ...queries });
    }

    @Permission('stocktake:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.stocktakeService.findOne(+id);
    }

    @Permission('stocktake:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateStocktakeDto: UpdateStocktakeDto) {
        return this.stocktakeService.update(+id, updateStocktakeDto);
    }

    @Permission('stocktake:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.stocktakeService.remove(+id);
    }

    @Permission('stocktake:autoAddDetail')
    @Post(':id/auto-add-detail')
    autoAddDetail(@Param('id', ParseIntPipe) id: string) {
        return this.stocktakeService.autoAddDetail(+id);
    }

    @Permission('stocktake:getDetails')
    @Get(':id/get-details')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'productId', required: false })
    getDetails(@Param('id', ParseIntPipe) id: string, @Query() queries, @Query('productId', ParseIntPipe) productId: string) {
        return this.stocktakeService.getDetails({ ...queries, stocktakeId: +id, productId });
    }

    @Permission('stocktake:addDetail')
    @Post(':id/add-detail')
    addDetail(@Param('id', ParseIntPipe) id: string, @Body() createStocktakeDetailDto: CreateStocktakeDetailDto) {
        return this.stocktakeService.addDetail(+id, createStocktakeDetailDto);
    }

    @Permission('stocktake:updateDetail')
    @Patch(':id/update-detail/:detailId')
    updateDetail(
        @Param('id', ParseIntPipe) id: string,
        @Param('detailId', ParseIntPipe) detailId: string,
        @Body() updateStocktakeDetailDto: UpdateStocktakeDetailDto,
    ) {
        return this.stocktakeService.updateDetail(+id, +detailId, updateStocktakeDetailDto);
    }

    @Permission('stocktake:removeDetail')
    @Delete(':id/remove-detail/:detailId')
    removeDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string) {
        return this.stocktakeService.removeDetail(+id, +detailId);
    }

    @Permission('stocktake:start')
    @Patch(':id/start')
    start(@Param('id', ParseIntPipe) id: string) {
        return this.stocktakeService.start(+id);
    }

    @Permission('stocktake:cancel')
    @Patch(':id/cancel')
    cancel(@Param('id', ParseIntPipe) id: string) {
        return this.stocktakeService.cancel(+id);
    }

    @Permission('stocktake:finish')
    @Patch(':id/finish')
    finish(@Param('id', ParseIntPipe) id: string) {
        return this.stocktakeService.finish(+id);
    }

    @Permission('stocktake:approve')
    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: string) {
        return this.stocktakeService.approve(+id);
    }

    @Permission('stocktake:reject')
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: string) {
        return this.stocktakeService.reject(+id);
    }

    @Permission('stocktake:tally')
    @Patch(':id/tally/:detailId')
    tally(@Param('id', ParseIntPipe) id: string, @Param('detailId') detailId: string, @Body() tallyDto: TallyStocktakeDetailDto) {
        return this.stocktakeService.tally(+id, +detailId, tallyDto);
    }
}
