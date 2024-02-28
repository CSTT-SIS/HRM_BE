import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';
import { RepairRequestEvent } from '~/modules/repair-request/events/repair-request.event';

@Injectable()
export class RepairRequestListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) {}

    @OnEvent('repairRequest.created')
    async handleRepairRequestCreatedEvent(event: RepairRequestEvent) {
        const entity = await this.database.repairRequest.findOne({ where: { id: event.id }, relations: ['repairBy'] });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('proposal:create');
        this.notificationService.createNotification({
            entity: 'repairRequest',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.repairById],
            type: 'repairRequest',
            link: `/warehouse-process/repair`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu sửa chữa '${entity.name}' đã được tạo`,
                    content: `Yêu cầu sửa chữa '${entity.name}' đã được tạo`,
                },
                {
                    lang: 'en',
                    title: `Repair request '${entity.name}' has been created`,
                    content: `Repair request '${entity.name}' has been created`,
                },
                {
                    lang: 'lo',
                    title: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກສ້າງແລ້ວ`,
                    content: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກສ້າງແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('repairRequest.inProgress')
    async handleRepairRequestInProgressEvent(event: RepairRequestEvent) {
        const entity = await this.database.repairRequest.findOne({ where: { id: event.id }, relations: ['repairBy'] });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('repairRequest:complete');
        this.notificationService.createNotification({
            entity: 'repairRequest',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.repairById, entity.createdById],
            type: 'repairRequest',
            link: `/warehouse-process/repair`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu sửa chữa '${entity.name}' đã được tiếp nhận`,
                    content: `Yêu cầu sửa chữa '${entity.name}' đã được tiếp nhận`,
                },
                {
                    lang: 'en',
                    title: `Repair request '${entity.name}' has been received`,
                    content: `Repair request '${entity.name}' has been received`,
                },
                {
                    lang: 'lo',
                    title: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກຮັບແລ້ວ`,
                    content: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກຮັບແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('repairRequest.completed')
    async handleRepairRequestCompletedEvent(event: RepairRequestEvent) {
        const entity = await this.database.repairRequest.findOne({ where: { id: event.id }, relations: ['repairBy'] });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'repairRequest',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById, entity.repairById],
            type: 'repairRequest',
            link: `/warehouse-process/repair`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu sửa chữa '${entity.name}' đã được hoàn thành`,
                    content: `Yêu cầu sửa chữa '${entity.name}' đã được hoàn thành`,
                },
                {
                    lang: 'en',
                    title: `Repair request '${entity.name}' has been completed`,
                    content: `Repair request '${entity.name}' has been completed`,
                },
                {
                    lang: 'lo',
                    title: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກສຳເລັດ`,
                    content: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກສຳເລັດ`,
                },
            ],
        });
    }
}
