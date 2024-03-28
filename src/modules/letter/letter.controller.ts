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
    @Post()
    create(@Req() req, @Body() createLetterDto: CreateLetterDto) {
        return this.letterService.create(createLetterDto, req.user.id);
    }

    @Permission('letter:findAll')
    @ApiQuery({ type: FilterDto })
    @Get()
    findAll(@Query() queries) {
        return this.letterService.findAll({ ...queries });
    }

    @Permission('letter:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.letterService.findOne(+id);
    }

    @UseGuards(AuthGuard)
    @Permission('letter:update')
    @Patch(':id')
    update(@Req() req, @Param('id', ParseIntPipe) id: string, @Body() updateLetterDto: UpdateLetterDto) {
        return this.letterService.update(+id, updateLetterDto, req.user.id);
    }

    @Permission('letter:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.letterService.remove(+id);
    }
}
