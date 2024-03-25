import { Module } from '@nestjs/common';
import { CronJobListener } from '~/modules/notification/listeners/cronjob.listener';
import { InventoryListener } from '~/modules/notification/listeners/inventory.listener';
import { OrderListener } from '~/modules/notification/listeners/order.listener';
import { ProposalListener } from '~/modules/notification/listeners/proposal.listener';
import { WarehousingBillListener } from '~/modules/notification/listeners/warehousing-bill.listener';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
    controllers: [NotificationController],
    providers: [NotificationService, ProposalListener, WarehousingBillListener, OrderListener, CronJobListener, InventoryListener],
})
export class NotificationModule {}
