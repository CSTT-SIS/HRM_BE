import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
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
    findAll(@Query() queries) {
        return this.proposalService.findAll({ ...queries });
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
}
