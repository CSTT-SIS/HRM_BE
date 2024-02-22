import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import { LetterService } from './letter.service';

@ApiTags('Letter')
@ApiBasicAuth('authorization')
@Controller('letter')
export class LetterController {
    constructor(private readonly letterService: LetterService) {}

    @Permission('letter:create')
    @Post()
    create(@Body() createLetterDto: CreateLetterDto) {
        return this.letterService.create(createLetterDto);
    }

    @Permission('letter:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.letterService.findAll({ ...queries });
    }

    @Permission('letter:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.letterService.findOne(+id);
    }

    @Permission('letter:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateLetterDto: UpdateLetterDto) {
        return this.letterService.update(+id, updateLetterDto);
    }

    @Permission('letter:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.letterService.remove(+id);
    }
}
