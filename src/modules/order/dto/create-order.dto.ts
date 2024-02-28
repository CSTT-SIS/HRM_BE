import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ORDER_TYPE } from '~/common/enums/enum';

export class CreateOrderDto {
    // @ApiProperty({ type: 'number', description: 'Proposal Id' })
    // @IsNotEmpty({ message: 'Mã phiếu đề xuất không được để trống' })
    // @IsNumber({}, { message: 'Mã phiếu đề xuất phải là số' })
    // @IsIdExist({ entity: 'proposal' }, { message: 'Mã phiếu đề xuất không tồn tại' })
    // proposalId: number;

    @ApiProperty({ type: 'array', description: 'Proposal Ids' })
    @ArrayNotEmpty({ message: 'Mã phiếu đề xuất không được để trống' })
    proposalIds: number[];

    @ApiProperty({ type: 'string', description: 'type' })
    @IsNotEmpty({ message: 'Loại không được để trống' })
    @Transform(({ value }) => ('' + value).toUpperCase())
    @IsEnum(ORDER_TYPE, { message: 'Loại đơn hàng không hợp lệ' })
    type: ORDER_TYPE;

    @ApiProperty({ type: 'string', description: 'name' })
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;

    @ApiProperty({ type: 'string', description: 'code' })
    @IsNotEmpty({ message: 'Mã không được để trống' })
    code: string;

    @ApiProperty({ type: 'string', description: 'Provider information' })
    @IsNotEmpty({ message: 'Đơn vị cung cấp không được để trống' })
    @IsString({ message: 'Đơn vị cung cấp phải là chuỗi' })
    provider: string;

    @ApiProperty({ type: 'string', description: 'Estimated Delivery Date' })
    @IsNotEmpty({ message: 'Ngày giao hàng dự kiến không được để trống' })
    @Matches(/^(\d{4})-(\d{2})-(\d{2})$/, { message: 'Ngày giao hàng dự kiến không đúng định dạng YYYY-MM-DD' })
    estimatedDeliveryDate: string;
}
