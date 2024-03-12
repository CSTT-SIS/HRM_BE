import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ONLY_ADMIN } from '~/common/constants/constant';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { ApprovalManagementService } from './approval-management.service';
import { CreateApprovalManagementDto } from './dto/create-approval-management.dto';
import { UpdateApprovalManagementDto } from './dto/update-approval-management.dto';

@ApiTags('ApprovalManagement')
@ApiBasicAuth('authorization')
@Controller('approval-management')
export class ApprovalManagementController {
    constructor(private readonly approvalManagementService: ApprovalManagementService) {}

    @Permission(ONLY_ADMIN)
    @Post()
    create(@Body() createApprovalManagementDto: CreateApprovalManagementDto) {
        return this.approvalManagementService.create(createApprovalManagementDto);
    }

    @Permission(ONLY_ADMIN)
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.approvalManagementService.findAll({ ...queries });
    }

    @Permission(ONLY_ADMIN)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.approvalManagementService.findOne(+id);
    }

    @Permission(ONLY_ADMIN)
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateApprovalManagementDto: UpdateApprovalManagementDto) {
        return this.approvalManagementService.update(+id, updateApprovalManagementDto);
    }

    @Permission(ONLY_ADMIN)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.approvalManagementService.remove(+id);
    }
}
