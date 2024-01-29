import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { BYPASS_PERMISSION } from '~/common/constants/constant';

@ApiTags('User')
@ApiBasicAuth('authorization')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Permission('user:create')
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Permission('user:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.userService.findAll({ ...queries });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('demo-export')
    async generateDemo(@Res() res: Response) {
        const templateFile = 'Template/System/absx.docx'; // đường dẫn tới file template
        const data = {
            first_name: 'John',
            last_name: 'Doe',
            phone: '0652455478',
            description: 'New Website',
        }; // dữ liệu mẫu

        await this.userService.generateDocxFromTemplate(templateFile, data, res);
    }

    @Permission('user:findOne')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findOne(+id);
    }

    @Permission('user:update')
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(+id, updateUserDto);
    }

    @Permission('user:remove')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }
}
