import { Module } from '@nestjs/common';
import { ProviderController } from '~/modules/provider/provider.controller';
import { ProviderService } from './provider.service';

@Module({
    controllers: [ProviderController],
    providers: [ProviderService],
})
export class ProviderModule {}
