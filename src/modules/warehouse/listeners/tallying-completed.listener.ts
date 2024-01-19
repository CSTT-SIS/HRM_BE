import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WarehouseService } from '~/modules/warehouse/warehouse.service';
import { TallyingCompletedEvent } from '~/modules/warehousing-bill/events/tallying-completed.event';

@Injectable()
export class TallyingCompletedListener {
    constructor(private readonly warehouseService: WarehouseService) {}

    @OnEvent('tallying.completed')
    handleTallyingCompletedEvent(event: TallyingCompletedEvent) {
        this.warehouseService.updateInventory(event.billId);
    }
}
