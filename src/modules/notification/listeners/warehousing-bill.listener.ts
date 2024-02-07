import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';
import { WarehousingBillEvent } from '~/modules/warehousing-bill/events/warehousing-bill.event';

@Injectable()
export class WarehousingBillListener {
    constructor(private readonly nofiticationService: NotificationService, private readonly database: DatabaseService) {}

    @OnEvent('warehousingBill.created')
    async handleWarehousingBillCreatedEvent(event: WarehousingBillEvent) {
        const entity = await this.database.warehousingBill.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('warehousingBill:approve');
        this.nofiticationService.createNotification({
            senderId: event.senderId,
            receiverIds,
            title: `Phiếu kho '${entity.name}' đang chờ phê duyệt`,
            content: `Phiếu kho '${entity.name}' đang chờ phê duyệt`,
            type: 'warehousing-bill',
            link: `/product-management/warehousing-bill`,
        });
    }
}
