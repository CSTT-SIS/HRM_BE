import { Module } from '@nestjs/common';
import { ProposalTypeController } from './proposal-type.controller';
import { ProposalTypeService } from './proposal-type.service';

@Module({
    controllers: [ProposalTypeController],
    providers: [ProposalTypeService],
})
export class ProposalTypeModule {}
