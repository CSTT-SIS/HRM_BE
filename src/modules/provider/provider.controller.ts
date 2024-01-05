import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProviderService } from './provider.service';

@ApiTags('Provider')
@ApiBasicAuth('authorization')
@Controller('provider')
export class ProviderController {
    constructor(private readonly providerService: ProviderService) {}

    @Permission('provider:create')
    @Post()
    create(@Body() createProviderDto: CreateProviderDto) {
        return this.providerService.create(createProviderDto);
    }

    @Permission('provider:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.providerService.findAll({ ...queries });
    }

    @Permission('provider:findOne')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.providerService.findOne(+id);
    }

    @Permission('provider:update')
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProviderDto: UpdateProviderDto) {
        return this.providerService.update(+id, updateProviderDto);
    }

    @Permission('provider:remove')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.providerService.remove(+id);
    }
}
