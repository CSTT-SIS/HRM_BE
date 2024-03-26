import { CalendarService } from './../calendar/calendar.service';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBasicAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateHumanDto } from './dto/create-human.dto';
import { UpdateHumanDto } from './dto/update-human.dto';
import { HumanService } from './human.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '~/config/fileUpload.config';
import { HUMAN_DASHBOARD_TYPE } from '~/common/enums/enum';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Human')
@ApiBasicAuth('authorization')
@Controller('human')
export class HumanController {
    constructor(private readonly humanService: HumanService, private readonly calendarService: CalendarService) {}

    @UseGuards(AuthGuard)
    @ApiConsumes('multipart/form-data')
    @Permission('human:create')
    @Post()
    @UseInterceptors(FileInterceptor('avatar', multerOptions()))
    create(@Req() req, @Body() createHumanDto: CreateHumanDto, @UploadedFile() avatar: Express.Multer.File) {
        return this.humanService.create(createHumanDto, avatar, req.user.id);
    }

    @Permission('human:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.humanService.findAll({ ...queries });
    }

    @Permission('human:findAll')
    @Get('by-position-group-id')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({
        name: 'positionGroupId',
        type: Number,
        description: 'Id nhóm chức vụ',
        required: true,
    })
    findAllByPositionGroup(@Query() queries, @Query('positionGroupId', new ParseIntPipe({ optional: true })) positionGroupId: string) {
        return this.humanService.findAllByPositionGroup({ ...queries, positionGroupId });
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

    @UseGuards(AuthGuard)
    @Permission('calendar:findAll')
    @Get('calendar')
    findAllCalendarByUserLogin(@Req() req, @Query() queries) {
        return this.calendarService.findAllByUserLogin({ ...queries, userId: req.user.id });
    }

    @Permission('human:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.humanService.findOne(+id);
    }

    @UseGuards(AuthGuard)
    @ApiConsumes('multipart/form-data')
    @Permission('human:update')
    @Patch(':id')
    @UseInterceptors(FileInterceptor('avatar', multerOptions()))
    update(@Req() req, @Param('id', ParseIntPipe) id: string, @Body() updateHumanDto: UpdateHumanDto, @UploadedFile() avatar: Express.Multer.File) {
        return this.humanService.update(+id, updateHumanDto, avatar, req.user.id);
    }

    @Permission('human:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.humanService.remove(+id);
    }

    // @UseGuards(AuthGuard)
    // @Permission('calendar:update')
    // @Patch('calendar/:id')
    // updateCalendar(@Req() req, @Param('id', ParseIntPipe) id: string, @Body() updateCalendarDto: UpdateCalendarDto) {
    //     return this.calendarService.update(+id, updateCalendarDto, req.user.id);
    // }
}
