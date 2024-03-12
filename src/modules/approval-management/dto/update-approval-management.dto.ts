import { PartialType } from '@nestjs/swagger';
import { CreateApprovalManagementDto } from './create-approval-management.dto';

export class UpdateApprovalManagementDto extends PartialType(CreateApprovalManagementDto) {}
