import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWarehouseTypeDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Tên loại kho không được để trống' })
    name: string;

    @ApiProperty()
    @IsOptional()
    description: string;
}
