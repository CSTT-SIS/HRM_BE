import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

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
    @Min(0, { message: 'Giá sản phẩm không được nhỏ hơn 0' })
    @Max(9999999999, { message: 'Giá sản phẩm không được lớn hơn 9999999999' })
    price: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber({}, { message: 'Thuế sản phẩm phải là số' })
    @Min(0, { message: 'Thuế sản phẩm không được nhỏ hơn 0' })
    @Max(999, { message: 'Thuế sản phẩm không được lớn hơn 999' })
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
