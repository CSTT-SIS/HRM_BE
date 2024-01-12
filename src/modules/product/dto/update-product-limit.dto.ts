import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateProductLimitDto {
    @ApiProperty({ default: 0 })
    @IsNotEmpty({ message: 'minQuantity không được để trống' })
    @IsNumber({}, { message: 'minQuantity phải là số' })
    minQuantity: number;

    @ApiProperty({ default: 100 })
    @IsNotEmpty({ message: 'maxQuantity không được để trống' })
    @IsNumber({}, { message: 'maxQuantity phải là số' })
    maxQuantity: number;
}
