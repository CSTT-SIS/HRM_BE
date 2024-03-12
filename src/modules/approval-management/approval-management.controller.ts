import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateApprovalManagementDto } from './dto/create-approval-management.dto';
import { UpdateApprovalManagementDto } from './dto/update-approval-management.dto';
import { ApprovalManagementService } from './approval-management.service';

@ApiTags('ApprovalManagement')
@ApiBasicAuth('authorization')
@Controller('approval-management')
export class ApprovalManagementController {
    constructor(private readonly approvalManagementService: ApprovalManagementService) {}

    @Permission('approvalManagement:create')
    @Post()
    create(@Body() createApprovalManagementDto: CreateApprovalManagementDto) {
        return this.approvalManagementService.create(createApprovalManagementDto);
    }

    @Permission('approvalManagement:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.approvalManagementService.findAll({ ...queries });
    }

    @Permission('approvalManagement:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.approvalManagementService.findOne(+id);
    }

    @Permission('approvalManagement:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateApprovalManagementDto: UpdateApprovalManagementDto) {
        return this.approvalManagementService.update(+id, updateApprovalManagementDto);
    }

    @Permission('approvalManagement:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.approvalManagementService.remove(+id);
    }
}
