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

    async countUnread() {
        const res = await this.database.notification.countBy({ receiverId: UserStorage.getId(), isRead: false });
        return { count: res };
    }

    async markAsRead(notificationId: string) {
        if (!notificationId) return;
        return this.database.notification.update({ id: +notificationId, receiverId: UserStorage.getId() }, { isRead: true });
    }

    async markAllAsRead() {
        return this.database.notification.update({ receiverId: UserStorage.getId() }, { isRead: true });
    }

    createNotification(data: { senderId: number; receiverIds: number[]; title: string; content: string; type: string; link: string }) {
        if (!data.receiverIds || data.receiverIds.length === 0) return;
        const entities = data.receiverIds.map((receiverId) => {
            return this.database.notification.create({
                senderId: data.senderId,
                receiverId,
                title: data.title,
                content: data.content,
                type: data.type,
                link: data.link,
            });
        });
        return this.database.notification.save(entities);
    }
}
