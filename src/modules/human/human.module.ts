import { Module } from '@nestjs/common';
import { HumanController } from './human.controller';
import { HumanService } from './human.service';

@Module({
    controllers: [HumanController],
    providers: [HumanService],
})
export class HumanModule {}
