import { Module } from '@nestjs/common';
import { ProposalCreatedListener } from '~/modules/notification/listeners/proposal-created.listener';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
    controllers: [NotificationController],
    providers: [NotificationService, ProposalCreatedListener],
})
export class NotificationModule {}
