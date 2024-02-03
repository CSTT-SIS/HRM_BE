import { Module } from '@nestjs/common';
import { ProposalListener } from '~/modules/notification/listeners/proposal.listener';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
    controllers: [NotificationController],
    providers: [NotificationService, ProposalListener],
})
export class NotificationModule {}
