import { Controller, Get, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notification')
@ApiBasicAuth('authorization')
@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Permission(BYPASS_PERMISSION)
    @Get()
    findAll(@Query() queries: FilterDto) {
        return this.notificationService.findAll({ ...queries });
    }
}
