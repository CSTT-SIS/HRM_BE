import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class ImportGoodDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Vui lòng chọn sản phẩm' })
    productId: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Vui lòng nhập số lượng' })
    @IsNumber({}, { message: 'Số lượng phải là số' })
    @Min(1, { message: 'Số lượng phải lớn hơn 0' })
    quantity: number;

    @ApiProperty()
    @IsOptional()
    errorQuantity: number;
}
