import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateProposalTypeDto } from './dto/create-proposal-type.dto';
import { UpdateProposalTypeDto } from './dto/update-proposal-type.dto';
import { ProposalTypeService } from './proposal-type.service';

@ApiTags('ProposalType')
@ApiBasicAuth('authorization')
@Controller('proposal-type')
export class ProposalTypeController {
    constructor(private readonly proposalTypeService: ProposalTypeService) {}

    @Permission('proposalType:create')
    @Post()
    create(@Body() createProposalTypeDto: CreateProposalTypeDto) {
        return this.proposalTypeService.create(createProposalTypeDto);
    }

    @Permission('proposalType:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.proposalTypeService.findAll({ ...queries });
    }

    @Permission('proposalType:findOne')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.proposalTypeService.findOne(+id);
    }

    @Permission('proposalType:update')
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProposalTypeDto: UpdateProposalTypeDto) {
        return this.proposalTypeService.update(+id, updateProposalTypeDto);
    }

    @Permission('proposalType:remove')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.proposalTypeService.remove(+id);
    }
}
