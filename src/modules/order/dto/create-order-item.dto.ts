import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateOrderItemDto {
    @ApiProperty({ type: 'number' })
    @IsNotEmpty({ message: 'Mã sản phẩm không được để trống' })
    @IsNumber({}, { message: 'Mã sản phẩm phải là số' })
    @IsIdExist({ entity: 'product' }, { message: 'Mã sản phẩm không tồn tại' })
    productId: number;

    @ApiProperty({ type: 'number' })
    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    @IsNumber({}, { message: 'Số lượng phải là số' })
    @Min(1, { message: 'Số lượng phải lớn hơn 0' })
    quantity: number;

    @ApiProperty({ type: 'number' })
    @IsOptional()
    @Min(0, { message: 'Đơn giá phải lớn hơn hoặc bằng 0' })
    price: number;
}
