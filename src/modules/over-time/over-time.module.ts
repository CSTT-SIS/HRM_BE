import { Module } from '@nestjs/common';
import { OverTimeController } from './over-time.controller';
import { OverTimeService } from './over-time.service';

@Module({
    controllers: [OverTimeController],
    providers: [OverTimeService],
})
export class OverTimeModule {}
