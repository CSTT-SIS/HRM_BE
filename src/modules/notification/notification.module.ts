import { Module } from '@nestjs/common';
import { OrderListener } from '~/modules/notification/listeners/order.listener';
import { ProposalListener } from '~/modules/notification/listeners/proposal.listener';
import { WarehousingBillListener } from '~/modules/notification/listeners/warehousing-bill.listener';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
    controllers: [NotificationController],
    providers: [NotificationService, ProposalListener, WarehousingBillListener, OrderListener],
})
export class NotificationModule {}
