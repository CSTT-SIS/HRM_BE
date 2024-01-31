import { Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';

@Injectable()
export class NotificationService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    async findAll(queries: FilterDto) {
        return this.database.notification.getNotificationByReceiverId({
            receiverId: UserStorage.getId(),
            ...queries,
        });
    }
}
