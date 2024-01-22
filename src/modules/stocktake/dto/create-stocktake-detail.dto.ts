import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateStocktakeDetailDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Mã sản phẩm không được để trống' })
    @IsNumber({}, { message: 'Mã sản phẩm phải là số' })
    productId: number;
}
