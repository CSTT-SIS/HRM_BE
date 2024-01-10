import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductCategoryDto {
    @ApiProperty({ description: 'Tên danh mục sản phẩm' })
    @IsNotEmpty({ message: 'Tên danh mục sản phẩm không được để trống' })
    name: string;

    @ApiProperty({ description: 'Mô tả danh mục sản phẩm' })
    @IsOptional()
    description: string;
}
