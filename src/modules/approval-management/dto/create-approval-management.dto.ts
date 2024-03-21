import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateApprovalManagementDto {
    @ApiProperty()
    @IsNotEmpty()
    entity: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsIdExist({ entity: 'user' }, { message: 'ApproverId not found' })
    approverId: number;

    @ApiProperty()
    @IsNotEmpty()
    toStatus: string;
}
