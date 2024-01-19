import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { PROPOSAL_STATUS } from '~/common/enums/enum';
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
    @ApiQuery({ name: 'typeId', required: false })
    @ApiQuery({ name: 'status', enum: PROPOSAL_STATUS, required: false })
    findAll(@Query() queries, @Query('typeId') typeId: number, @Query('status') status: string) {
        return this.proposalService.findAll({ ...queries, typeId, status });
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

    @Permission('proposal:approve')
    @Patch(':id/approve')
    approve(@Param('id') id: string) {
        return this.proposalService.approve(+id);
    }

    @Permission('proposal:reject')
    @Patch(':id/reject')
    reject(@Param('id') id: string) {
        return this.proposalService.reject(+id);
    }

    @Permission('proposal:return')
    @Patch(':id/return')
    return(@Param('id') id: string) {
        return this.proposalService.return(+id);
    }
}
