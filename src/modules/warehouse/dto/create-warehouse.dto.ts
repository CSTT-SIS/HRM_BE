import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWarehouseDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Tên kho không được để trống' })
    name: string;

    @ApiProperty()
    @IsOptional()
    code: string;

    @ApiProperty()
    @IsOptional()
    typeId: number;

    @ApiProperty()
    @IsOptional()
    description: string;

    @ApiProperty()
    @IsOptional()
    address: string;
}
