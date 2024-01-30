import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateRepairDetailDto } from '~/modules/repair-request/dto/create-repair-detail.dto';
import { UpdateRepairDetailDto } from '~/modules/repair-request/dto/update-repair-detail.dto';
import { CreateRepairRequestDto } from './dto/create-repair-request.dto';
import { UpdateRepairRequestDto } from './dto/update-repair-request.dto';
import { RepairRequestService } from './repair-request.service';

@ApiTags('Repair Request')
@ApiBasicAuth('authorization')
@Controller('repair-request')
export class RepairRequestController {
    constructor(private readonly repairRequestService: RepairRequestService) {}

    @Permission('repairRequest:create')
    @Post()
    create(@Body() createRepairRequestDto: CreateRepairRequestDto) {
        return this.repairRequestService.create(createRepairRequestDto);
    }

    @Permission('repairRequest:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.repairRequestService.findAll({ ...queries });
    }

    @Permission('repairRequest:findOne')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.repairRequestService.findOne(+id);
    }

    @Permission('repairRequest:update')
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateRepairRequestDto: UpdateRepairRequestDto) {
        return this.repairRequestService.update(+id, updateRepairRequestDto);
    }

    @Permission('repairRequest:remove')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.repairRequestService.remove(+id);
    }

    @Permission('repairRequest:getDetails')
    @Get(':id/get-details')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'productId', required: false })
    getDetails(@Param('id') id: string, @Query() queries, @Query('productId') productId: string) {
        return this.repairRequestService.getDetails({ ...queries, requestId: +id, productId });
    }

    @Permission('repairRequest:addDetail')
    @Post(':id/details')
    addDetail(@Param('id') id: string, @Body() body: CreateRepairDetailDto) {
        return this.repairRequestService.addDetail(+id, body);
    }

    @Permission('repairRequest:updateDetail')
    @Patch(':id/details/:detailId')
    updateDetail(@Param('id') id: string, @Param('detailId') detailId: string, @Body() body: UpdateRepairDetailDto) {
        return this.repairRequestService.updateDetail(+id, +detailId, body);
    }

    @Permission('repairRequest:removeDetail')
    @Delete(':id/details/:detailId')
    removeDetail(@Param('id') id: string, @Param('detailId') detailId: string) {
        return this.repairRequestService.removeDetail(+id, +detailId);
    }

    @Permission('repairRequest:inProgress')
    @Patch(':id/in-progress')
    inProgress(@Param('id') id: string) {
        return this.repairRequestService.inProgress(+id);
    }

    @Permission('repairRequest:complete')
    @Patch(':id/complete')
    complete(@Param('id') id: string) {
        return this.repairRequestService.complete(+id);
    }
}
