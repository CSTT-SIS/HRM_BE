import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CalendarService } from './calendar.service';

@ApiTags('Calendar')
@ApiBasicAuth('authorization')
@Controller('calendar')
export class CalendarController {
    constructor(private readonly calendarService: CalendarService) {}

    @Permission('calendar:create')
    @Post()
    create(@Body() createCalendarDto: CreateCalendarDto) {
        return this.calendarService.create(createCalendarDto);
    }

    @Permission('calendar:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.calendarService.findAll({ ...queries });
    }

    @Permission('calendar:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.calendarService.findOne(+id);
    }

    @Permission('calendar:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateCalendarDto: UpdateCalendarDto) {
        return this.calendarService.update(+id, updateCalendarDto);
    }

    @Permission('calendar:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.calendarService.remove(+id);
    }
}
