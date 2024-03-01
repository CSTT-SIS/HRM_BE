import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateRepairDetailDto, CreateRepairDetailsDto } from '~/modules/repair-request/dto/create-repair-detail.dto';
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
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.repairRequestService.findOne(+id);
    }

    @Permission('repairRequest:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateRepairRequestDto: UpdateRepairRequestDto) {
        return this.repairRequestService.update(+id, updateRepairRequestDto);
    }

    @Permission('repairRequest:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.repairRequestService.remove(+id);
    }

    @Permission('repairRequest:headApprove')
    @Patch(':id/head-approve')
    headApprove(@Param('id', ParseIntPipe) id: string) {
        return this.repairRequestService.headApprove(+id);
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
    @Permission('repairRequest:headReject')
    @Patch(':id/head-reject')
    headReject(@Param('id', ParseIntPipe) id: string, @Body() body: { comment: string }) {
        return this.repairRequestService.headReject(+id, body?.comment);
    }

    @Permission('repairRequest:getDetails')
    @Get(':id/detail')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'replacementPartId', required: false })
    getDetails(
        @Param('id', ParseIntPipe) id: string,
        @Query() queries,
        @Query('replacementPartId', new ParseIntPipe({ optional: true })) replacementPartId: string,
    ) {
        return this.repairRequestService.getDetails({ ...queries, requestId: +id, replacementPartId });
    }

    @Permission('repairRequest:addDetail')
    @Post(':id/detail')
    addDetail(@Param('id', ParseIntPipe) id: string, @Body() body: CreateRepairDetailDto) {
        return this.repairRequestService.addDetail(+id, body);
    }

    @Permission('repairRequest:addDetail')
    @Post(':id/add-details')
    addDetails(@Param('id', ParseIntPipe) id: string, @Body() body: CreateRepairDetailsDto) {
        return this.repairRequestService.addDetails(+id, body);
    }

    @Permission('repairRequest:updateDetail')
    @Patch(':id/detail/:detailId')
    updateDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string, @Body() body: UpdateRepairDetailDto) {
        return this.repairRequestService.updateDetail(+id, +detailId, body);
    }

    @Permission('repairRequest:removeDetail')
    @Delete(':id/detail/:detailId')
    removeDetail(@Param('id', ParseIntPipe) id: string, @Param('detailId', ParseIntPipe) detailId: string) {
        return this.repairRequestService.removeDetail(+id, +detailId);
    }

    // @Permission('repairRequest:inProgress')
    // @Patch(':id/in-progress')
    // inProgress(@Param('id', ParseIntPipe) id: string) {
    //     return this.repairRequestService.inProgress(+id);
    // }

    // @Permission('repairRequest:complete')
    // @Patch(':id/complete')
    // complete(@Param('id', ParseIntPipe) id: string) {
    //     return this.repairRequestService.complete(+id);
    // }
}
