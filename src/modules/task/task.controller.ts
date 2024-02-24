import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Task')
@ApiBasicAuth('authorization')
@Controller('task')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @UseGuards(AuthGuard)
    @Permission('task:create')
    @Post()
    create(@Req() req, @Body() createTaskDto: CreateTaskDto) {
        return this.taskService.create(createTaskDto, req.user.id);
    }

    @Permission('task:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.taskService.findAll({ ...queries });
    }

    @Permission('task:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.taskService.findOne(+id);
    }

    @UseGuards(AuthGuard)
    @Permission('task:update')
    @Patch(':id')
    update(@Req() req, @Param('id', ParseIntPipe) id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.taskService.update(+id, updateTaskDto, req.user.id);
    }

    @Permission('task:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.taskService.remove(+id);
    }
}
