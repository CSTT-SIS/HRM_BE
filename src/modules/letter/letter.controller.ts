import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import { LetterService } from './letter.service';
import { LETTER_TYPE } from '~/common/enums/enum';

@ApiTags('Letter')
@ApiBasicAuth('authorization')
@Controller('letter')
export class LetterController {
    constructor(private readonly letterService: LetterService) {}

    @Permission('letter:create')
    @Post(':type')
    @ApiParam({
        name: 'type',
        enum: LETTER_TYPE,
        description: 'LATE: Đơn xin đi muộn, SOON: Đơn xin về sớm',
        required: true,
    })
    create(@Param('type') type: LETTER_TYPE, @Body() createLetterDto: CreateLetterDto) {
        return this.letterService.create(createLetterDto, type);
    }

    @Permission('letter:findAll')
    @Get(':type')
    @ApiParam({
        name: 'type',
        enum: LETTER_TYPE,
        description: 'LATE: Đơn xin đi muộn, SOON: Đơn xin về sớm',
        required: true,
    })
    @ApiQuery({ type: FilterDto })
    findAll(@Param('type') type: LETTER_TYPE, @Query() queries) {
        return this.letterService.findAll({ ...queries }, type);
    }

    @Permission('letter:findOne')
    @Get(':type/:id')
    @ApiParam({
        name: 'type',
        enum: LETTER_TYPE,
        description: 'LATE: Đơn xin đi muộn, SOON: Đơn xin về sớm',
        required: true,
    })
    findOne(@Param('type') type: LETTER_TYPE, @Param('id', ParseIntPipe) id: string) {
        return this.letterService.findOne(+id, type);
    }

    @Permission('letter:update')
    @Patch(':type/:id')
    @ApiParam({
        name: 'type',
        enum: LETTER_TYPE,
        description: 'LATE: Đơn xin đi muộn, SOON: Đơn xin về sớm',
        required: true,
    })
    update(@Param('id', ParseIntPipe) id: string, @Body() updateLetterDto: UpdateLetterDto) {
        return this.letterService.update(+id, updateLetterDto);
    }

    @Permission('letter:remove')
    @Delete(':id')
    @ApiParam({
        name: 'type',
        enum: LETTER_TYPE,
        description: 'LATE: Đơn xin đi muộn, SOON: Đơn xin về sớm',
        required: true,
    })
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.letterService.remove(+id);
    }
}
