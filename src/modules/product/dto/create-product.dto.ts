import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Mã sản phẩm không được để trống' })
    code: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Giá sản phẩm không được để trống' })
    @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
    price: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber({}, { message: 'Thuế sản phẩm phải là số' })
    tax: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Đơn vị sản phẩm không được để trống' })
    @IsNumber({}, { message: 'Đơn vị sản phẩm phải là số' })
    unitId: number;

    @ApiProperty()
    @IsOptional()
    description: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber({}, { message: 'Loại sản phẩm phải là số' })
    categoryId: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber({}, { message: 'Nhà cung cấp phải là số' })
    providerId: number;
}
