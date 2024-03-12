import { Module } from '@nestjs/common';
import { ApprovalManagementController } from './approval-management.controller';
import { ApprovalManagementService } from './approval-management.service';

@Module({
    controllers: [ApprovalManagementController],
    providers: [ApprovalManagementService],
})
export class ApprovalManagementModule {}
