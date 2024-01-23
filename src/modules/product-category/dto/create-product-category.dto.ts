import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateProductCategoryDto {
    @ApiProperty({ description: 'Tên danh mục sản phẩm' })
    @IsNotEmpty({ message: 'Tên danh mục sản phẩm không được để trống' })
    @Length(1, 255, { message: 'Tên phải từ 1-255 ký tự' })
    name: string;

    @ApiProperty({ description: 'Mô tả danh mục sản phẩm' })
    @IsOptional()
    description: string;
}
