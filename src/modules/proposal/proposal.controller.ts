import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { PROPOSAL_STATUS, PROPOSAL_TYPE } from '~/common/enums/enum';
import { CreateProposalDetailDto } from '~/modules/proposal/dto/create-proposal-detail.dto';
import { UpdateProposalDetailDto } from '~/modules/proposal/dto/update-proposal-detail.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { ProposalService } from './proposal.service';

@ApiTags('Proposal')
@ApiBasicAuth('authorization')
@Controller('proposal')
export class ProposalController {
    constructor(private readonly proposalService: ProposalService) {}

    @Permission('proposal:create')
    @Post()
    create(@Body() createProposalDto: CreateProposalDto) {
        return this.proposalService.create(createProposalDto);
    }

    @Permission('proposal:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'type', enum: PROPOSAL_TYPE, required: false })
    @ApiQuery({ name: 'status', enum: PROPOSAL_STATUS, required: false })
    findAll(@Query() queries, @Query('type') type: string, @Query('status') status: string) {
        return this.proposalService.findAll({ ...queries, type, status });
    }

    @Permission('proposal:findOne')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.proposalService.findOne(+id);
    }

    @Permission('proposal:update')
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProposalDto: UpdateProposalDto) {
        return this.proposalService.update(+id, updateProposalDto);
    }

    @Permission('proposal:remove')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.proposalService.remove(+id);
    }

    @Permission('proposal:pending')
    @Patch(':id/pending')
    pending(@Param('id') id: string) {
        return this.proposalService.pending(+id);
    }

    @Permission('proposal:approve')
    @Patch(':id/approve')
    approve(@Param('id') id: string) {
        return this.proposalService.approve(+id);
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
    @Permission('proposal:reject')
    @Patch(':id/reject')
    reject(@Param('id') id: string, @Body() body: { comment: string }) {
        return this.proposalService.reject(+id, body?.comment);
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
    @Permission('proposal:return')
    @Patch(':id/return')
    return(@Param('id') id: string, @Body() body: { comment: string }) {
        return this.proposalService.return(+id, body?.comment);
    }

    @Permission('proposal:addDetail')
    @Post(':id/add-detail')
    addDetail(@Param('id') id: string, @Body() body: CreateProposalDetailDto) {
        return this.proposalService.addDetail(+id, body);
    }

    @Permission('proposal:updateDetail')
    @Patch(':id/update-detail/:detailId')
    updateDetail(@Param('id') id: string, @Param('detailId') detailId: string, @Body() body: UpdateProposalDetailDto) {
        return this.proposalService.updateDetail(+id, +detailId, body);
    }

    @Permission('proposal:removeDetail')
    @Delete(':id/remove-detail/:detailId')
    removeDetail(@Param('id') id: string, @Param('detailId') detailId: string) {
        return this.proposalService.removeDetail(+id, +detailId);
    }
}
