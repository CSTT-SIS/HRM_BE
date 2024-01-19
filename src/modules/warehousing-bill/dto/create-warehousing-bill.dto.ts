import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { WAREHOUSING_BILL_TYPE } from '~/common/enums/enum';

export class CreateWarehousingBillDto {
    @ApiProperty({ type: 'integer' })
    @IsNotEmpty({ message: 'Mã phiếu đề xuất không được để trống' })
    @IsNumber({}, { message: 'Mã phiếu đề xuất phải là số' })
    proposalId: number;

    @ApiProperty({ type: 'integer' })
    @IsNotEmpty({ message: 'Mã kho không được để trống' })
    @IsNumber({}, { message: 'Mã kho phải là số' })
    warehouseId: number;

    @ApiProperty({ type: 'string' })
    @IsNotEmpty({ message: 'Loại phiếu không được để trống' })
    @IsString({ message: 'Loại phiếu phải là chuỗi' })
    type: WAREHOUSING_BILL_TYPE;

    @ApiProperty({ type: 'string' })
    @IsOptional()
    @IsString({ message: 'Ghi chú phải là chuỗi' })
    note?: string;
}
