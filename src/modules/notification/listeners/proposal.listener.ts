import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';
import { ProposalEvent } from '~/modules/proposal/events/proposal.event';

@Injectable()
export class ProposalListener {
    constructor(private readonly nofiticationService: NotificationService, private readonly database: DatabaseService) {}

    @OnEvent('proposal.pending')
    async handleProposalPendingEvent(event: ProposalEvent) {
        const entity = await this.database.proposal.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('proposal:approve');
        this.nofiticationService.createNotification({
            senderId: event.senderId,
            receiverIds,
            title: `Đề xuất '${entity.name}' đang chờ phê duyệt`,
            content: `Đề xuất '${entity.name}' đang chờ phê duyệt`,
            type: 'proposal',
            link: `/product-management/proposal`,
        });
    }

    @OnEvent('proposal.approved')
    async handleProposalApprovedEvent(event: ProposalEvent) {
        const entity = await this.database.proposal.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('warehousingBill:create');
        this.nofiticationService.createNotification({
            senderId: event.senderId,
            receiverIds,
            title: `Đề xuất '${entity.name}' đã được phê duyệt`,
            content: `Đề xuất '${entity.name}' đã được phê duyệt`,
            type: 'proposal',
            link: `/product-management/proposal`,
        });

        this.nofiticationService.createNotification({
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            title: `Đề xuất '${entity.name}' đã được phê duyệt`,
            content: `Đề xuất '${entity.name}' đã được phê duyệt`,
            type: 'proposal',
            link: `/product-management/proposal`,
        });
    }

    @OnEvent('proposal.rejected')
    async handleProposalRejectedEvent(event: ProposalEvent) {
        const entity = await this.database.proposal.findOneBy({ id: event.id });
        if (!entity) return;

        this.nofiticationService.createNotification({
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            title: `Đề xuất '${entity.name}' đã bị từ chối`,
            content: `Đề xuất '${entity.name}' đã bị từ chối`,
            type: 'proposal',
            link: `/product-management/proposal`,
        });
    }

    @OnEvent('proposal.returned')
    async handleProposalReturnedEvent(event: ProposalEvent) {
        const entity = await this.database.proposal.findOneBy({ id: event.id });
        if (!entity) return;

        this.nofiticationService.createNotification({
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            title: `Đề xuất '${entity.name}' đã bị trả lại`,
            content: `Đề xuất '${entity.name}' đã bị trả lại`,
            type: 'proposal',
            link: `/product-management/proposal`,
        });
    }
}
