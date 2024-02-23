import { Module } from '@nestjs/common';
import { HumanController } from './human.controller';
import { HumanService } from './human.service';
import { CalendarService } from '../calendar/calendar.service';

@Module({
    controllers: [HumanController],
    providers: [HumanService, CalendarService],
})
export class HumanModule {}
