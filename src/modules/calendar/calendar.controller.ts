import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CalendarService } from './calendar.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Calendar')
@ApiBasicAuth('authorization')
@Controller('calendar')
export class CalendarController {
    constructor(private readonly calendarService: CalendarService) {}

    @UseGuards(AuthGuard)
    @Permission('calendar:create')
    @Post()
    create(@Req() req, @Body() createCalendarDto: CreateCalendarDto) {
        return this.calendarService.create(createCalendarDto, req.user.id);
    }

    @Permission('calendar:findAll')
    @Get()
    @ApiQuery({ name: 'departmentId', required: false, type: Number })
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries, @Query('departmentId', new ParseIntPipe({ optional: true })) departmentId: string) {
        return this.calendarService.findAll({ ...queries, departmentId });
    }

    @Permission('calendar:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.calendarService.findOne(+id);
    }

    @UseGuards(AuthGuard)
    @Permission('calendar:update')
    @Patch(':id')
    update(@Req() req, @Param('id', ParseIntPipe) id: string, @Body() updateCalendarDto: UpdateCalendarDto) {
        return this.calendarService.update(+id, updateCalendarDto, req.user.id);
    }

    @Permission('calendar:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.calendarService.remove(+id);
    }
}
