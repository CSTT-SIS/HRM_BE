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
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBasicAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateOverTimeDto } from './dto/create-over-time.dto';
import { UpdateOverTimeDto } from './dto/update-over-time.dto';
import { OverTimeService } from './over-time.service';
import { multerOptions } from '~/config/fileUpload.config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('OverTime')
@ApiBasicAuth('authorization')
@Controller('over-time')
export class OverTimeController {
    constructor(private readonly overTimeService: OverTimeService) {}

    @ApiConsumes('multipart/form-data')
    @Permission('overTime:create')
    @Post()
    @UseInterceptors(FilesInterceptor('supportingDocuments', 10, multerOptions()))
    create(@Body() createOverTimeDto: CreateOverTimeDto, @UploadedFiles() files: Array<Express.Multer.File>) {
        return this.overTimeService.create(createOverTimeDto, files);
    }

    @Permission('overTime:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.overTimeService.findAll({ ...queries });
    }

    @UseGuards(AuthGuard)
    @Permission('overTime:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.overTimeService.findOne(+id);
    }

    @ApiConsumes('multipart/form-data')
    @Permission('overTime:update')
    @Patch(':id')
    @UseInterceptors(FilesInterceptor('supportingDocuments', 10, multerOptions()))
    update(
        @Req() req,
        @Param('id', ParseIntPipe) id: string,
        @Body() updateOverTimeDto: UpdateOverTimeDto,
        @UploadedFiles() files: Array<Express.Multer.File>,
    ) {
        return this.overTimeService.update(+id, updateOverTimeDto, files, req.user.id);
    }

    @Permission('overTime:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.overTimeService.remove(+id);
    }
}
