import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateProductDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
    @Length(1, 255, { message: 'Tên phải từ 1-255 ký tự' })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Mã sản phẩm không được để trống' })
    code: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Đơn vị sản phẩm không được để trống' })
    @IsNumber({}, { message: 'Đơn vị sản phẩm phải là số' })
    @IsIdExist({ entity: 'unit' }, { message: 'Đơn vị sản phẩm không tồn tại' })
    unitId: number;

    @ApiProperty()
    @IsOptional()
    description: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber({}, { message: 'Loại sản phẩm phải là số' })
    @IsIdExist({ entity: 'productCategory' }, { message: 'Loại sản phẩm không tồn tại' })
    categoryId: number;
}
