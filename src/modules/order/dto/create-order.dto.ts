import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ORDER_TYPE } from '~/common/enums/enum';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateOrderDto {
    @ApiProperty({ type: 'number', description: 'Proposal Id' })
    @IsNotEmpty({ message: 'Mã phiếu đề xuất không được để trống' })
    @IsNumber({}, { message: 'Mã phiếu đề xuất phải là số' })
    @IsIdExist({ entity: 'proposal' }, { message: 'Mã phiếu đề xuất không tồn tại' })
    proposalId: number;

    @ApiProperty({ type: 'string', description: 'type' })
    @IsNotEmpty({ message: 'Loại không được để trống' })
    type: ORDER_TYPE;
}
