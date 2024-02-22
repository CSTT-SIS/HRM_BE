import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiBasicAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateForgottenTimekeepingDto } from './dto/create-forgotten-timekeeping.dto';
import { UpdateForgottenTimekeepingDto } from './dto/update-forgotten-timekeeping.dto';
import { ForgottenTimekeepingService } from './forgotten-timekeeping.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '~/config/fileUpload.config';

@ApiTags('ForgottenTimekeeping')
@ApiBasicAuth('authorization')
@Controller('forgotten-timekeeping')
export class ForgottenTimekeepingController {
    constructor(private readonly forgottenTimekeepingService: ForgottenTimekeepingService) {}

    @ApiConsumes('multipart/form-data')
    @Permission('forgottenTimekeeping:create')
    @Post()
    @UseInterceptors(FilesInterceptor('supportingDocuments', 10, multerOptions()))
    create(@UploadedFiles() files: Array<Express.Multer.File>, @Body() createForgottenTimekeepingDto: CreateForgottenTimekeepingDto) {
        return this.forgottenTimekeepingService.create(createForgottenTimekeepingDto, files);
    }

    @Permission('forgottenTimekeeping:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.forgottenTimekeepingService.findAll({ ...queries });
    }

    @Permission('forgottenTimekeeping:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.forgottenTimekeepingService.findOne(+id);
    }

    @ApiConsumes('multipart/form-data')
    @Permission('forgottenTimekeeping:update')
    @Patch(':id')
    @UseInterceptors(FilesInterceptor('supportingDocuments', 10, multerOptions()))
    update(
        @Param('id', ParseIntPipe) id: string,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() updateForgottenTimekeepingDto: UpdateForgottenTimekeepingDto,
    ) {
        return this.forgottenTimekeepingService.update(+id, updateForgottenTimekeepingDto, files);
    }

    @Permission('forgottenTimekeeping:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.forgottenTimekeepingService.remove(+id);
    }
}
function checkMimeTypeCallback(file: any, cb: any) {
    throw new Error('Function not implemented.');
}
