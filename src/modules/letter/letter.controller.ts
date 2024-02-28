import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import { LetterService } from './letter.service';
import { LETTER_TYPE } from '~/common/enums/enum';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Letter')
@ApiBasicAuth('authorization')
@Controller('letter')
export class LetterController {
    constructor(private readonly letterService: LetterService) {}

    @UseGuards(AuthGuard)
    @Permission('letter:create')
    @Post(':type')
    @ApiParam({
        name: 'type',
        enum: LETTER_TYPE,
        description: 'LATE: Đơn xin đi muộn, SOON: Đơn xin về sớm',
        required: true,
    })
    create(@Req() req, @Param('type') type: LETTER_TYPE, @Body() createLetterDto: CreateLetterDto) {
        return this.letterService.create(createLetterDto, type, req.user.id);
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

    @UseGuards(AuthGuard)
    @Permission('letter:update')
    @Patch(':type/:id')
    @ApiParam({
        name: 'type',
        enum: LETTER_TYPE,
        description: 'LATE: Đơn xin đi muộn, SOON: Đơn xin về sớm',
        required: true,
    })
    update(@Req() req, @Param('id', ParseIntPipe) id: string, @Body() updateLetterDto: UpdateLetterDto) {
        return this.letterService.update(+id, updateLetterDto, req.user.id);
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
