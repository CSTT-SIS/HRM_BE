import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateProductLimitDto {
    @ApiProperty({ default: 0 })
    @IsNotEmpty({ message: 'minQuantity không được để trống' })
    @IsNumber({}, { message: 'minQuantity phải là số' })
    @Min(0, { message: 'minQuantity phải lớn hơn hoặc bằng 0' })
    minQuantity: number;

    @ApiProperty({ default: 100 })
    @IsNotEmpty({ message: 'maxQuantity không được để trống' })
    @IsNumber({}, { message: 'maxQuantity phải là số' })
    @Min(0, { message: 'maxQuantity phải lớn hơn hoặc bằng 0' })
    maxQuantity: number;
}
