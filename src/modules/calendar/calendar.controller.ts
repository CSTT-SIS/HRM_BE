import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CalendarService } from './calendar.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CALENDAR_TYPE } from '~/common/enums/enum';

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
    @ApiQuery({
        name: 'type',
        enum: CALENDAR_TYPE,
        description: 'BY_MONTH: Theo tháng, BY_WEEK: Theo tuần, BY_DAY: Theo ngày',
        required: true,
    })
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries, @Query('type') type: string) {
        return this.calendarService.findAll({ ...queries, type });
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
