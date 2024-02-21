import { CalendarService } from './../calendar/calendar.service';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateHumanDto } from './dto/create-human.dto';
import { UpdateHumanDto } from './dto/update-human.dto';
import { HumanService } from './human.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '~/config/fileUpload.config';
import { CreateCalendarDto } from '../calendar/dto/create-calendar.dto';
import { UpdateCalendarDto } from '../calendar/dto/update-calendar.dto';
import { HUMAN_DASHBOARD_TYPE } from '~/common/enums/enum';

@ApiTags('Human')
@ApiBasicAuth('authorization')
@Controller('human')
export class HumanController {
    constructor(private readonly humanService: HumanService, private readonly calendarService: CalendarService) {}

    @ApiConsumes('multipart/form-data')
    @Permission('human:create')
    @Post()
    @UseInterceptors(FileInterceptor('avatar', multerOptions()))
    create(@UploadedFile() file: Express.Multer.File, @Body() createHumanDto: CreateHumanDto) {
        return this.humanService.create(file, createHumanDto);
    }

    @Permission('human:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.humanService.findAll({ ...queries });
    }

    @Permission('human:dashboard')
    @Get('dashboard')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({
        name: 'type',
        enum: HUMAN_DASHBOARD_TYPE,
        description: 'SEX: Theo giới tính, SENIORITY: Thâm niên, BY_MONTH: Tình hình biến động theo tháng',
        required: true,
    })
    dashboard(@Query() queries, @Query('type') type: string) {
        return this.humanService.dashboard(queries, type);
    }

    @Permission('human:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.humanService.findOne(+id);
    }

    @ApiConsumes('multipart/form-data')
    @Permission('human:update')
    @Patch(':id')
    @UseInterceptors(FileInterceptor('avatar', multerOptions()))
    update(@Param('id', ParseIntPipe) id: string, @UploadedFile() file: Express.Multer.File, @Body() updateHumanDto: UpdateHumanDto) {
        return this.humanService.update(+id, file, updateHumanDto);
    }

    @Permission('human:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.humanService.remove(+id);
    }

    @Permission('calendar:create')
    @Post('calendar')
    createCalendar(@Body() createCalendarDto: CreateCalendarDto) {
        return this.calendarService.create(createCalendarDto);
    }

    @Permission('calendar:create')
    @Patch('calendar/:id')
    updateCalendar(@Param('id', ParseIntPipe) id: string, @Body() updateCalendarDto: UpdateCalendarDto) {
        return this.calendarService.update(+id, updateCalendarDto);
    }
}
