import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '~/modules/notification/notification.service';
import { ProposalCreatedEvent } from '~/modules/proposal/events/proposal-created.event';

@Injectable()
export class ProposalCreatedListener {
    constructor(private readonly nofiticationService: NotificationService) {}

    @OnEvent('proposal.created')
    handleProposalCreatedEvent(event: ProposalCreatedEvent) {
        console.log(event);
    }
}
