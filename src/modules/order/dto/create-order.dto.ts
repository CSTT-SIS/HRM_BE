import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ORDER_TYPE } from '~/common/enums/enum';

export class CreateOrderDto {
    // @ApiProperty({ type: 'number', description: 'Proposal Id' })
    // @IsNotEmpty({ message: 'Mã phiếu yêu cầu không được để trống' })
    // @IsNumber({}, { message: 'Mã phiếu yêu cầu phải là số' })
    // @IsIdExist({ entity: 'proposal' }, { message: 'Mã phiếu yêu cầu không tồn tại' })
    // proposalId: number;

    @ApiProperty({ description: 'Proposal Ids', example: [1, 2, 3] })
    @ArrayNotEmpty({ message: 'Mã phiếu yêu cầu không được để trống' })
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

    @ApiProperty({ type: 'string', description: 'Estimated Delivery Date', example: '2021-12-31 23:59:59' })
    @IsNotEmpty({ message: 'Ngày giao hàng dự kiến không được để trống' })
    @Matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, { message: 'Ngày giao hàng dự kiến không đúng định dạng YYYY-MM-DD HH:mm:ss' })
    estimatedDeliveryDate: string;
}
