import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateHumanDto } from './dto/create-human.dto';
import { UpdateHumanDto } from './dto/update-human.dto';
import { HumanService } from './human.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '~/config/fileUpload.config';

@ApiTags('Human')
@ApiBasicAuth('authorization')
@Controller('human')
export class HumanController {
    constructor(private readonly humanService: HumanService) {}

    @ApiConsumes('multipart/form-data')
    @Permission('human:create')
    @Post()
    @UseInterceptors(FileInterceptor('file', multerOptions()))
    create(@UploadedFile() file: Express.Multer.File, @Body() createHumanDto: CreateHumanDto) {
        return this.humanService.create(createHumanDto);
    }

    @Permission('human:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.humanService.findAll({ ...queries });
    }

    @Permission('human:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.humanService.findOne(+id);
    }

    @ApiConsumes('multipart/form-data')
    @Permission('human:update')
    @Patch(':id')
    @UseInterceptors(FileInterceptor('file', multerOptions()))
    update(@Param('id', ParseIntPipe) id: string, @UploadedFile() file: Express.Multer.File, @Body() updateHumanDto: UpdateHumanDto) {
        return this.humanService.update(+id, updateHumanDto);
    }

    @Permission('human:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.humanService.remove(+id);
    }
}
