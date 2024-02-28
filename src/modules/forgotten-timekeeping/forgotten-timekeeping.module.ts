import { Module } from '@nestjs/common';
import { ForgottenTimekeepingController } from './forgotten-timekeeping.controller';
import { ForgottenTimekeepingService } from './forgotten-timekeeping.service';

@Module({
    controllers: [ForgottenTimekeepingController],
    providers: [ForgottenTimekeepingService],
})
export class ForgottenTimekeepingModule {}
