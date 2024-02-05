import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateWarehouseDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Tên kho không được để trống' })
    @Length(1, 255, { message: 'Tên phải từ 1-255 ký tự' })
    name: string;

    @ApiProperty()
    @IsOptional()
    code: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber({}, { message: 'Mã loại kho phải là số' })
    @IsIdExist({ entity: 'warehouseType' }, { message: 'Mã loại kho không tồn tại' })
    typeId: number;

    @ApiProperty()
    @IsOptional()
    description: string;

    @ApiProperty()
    @IsOptional()
    address: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber({}, { message: 'Mã người quản lý phải là số' })
    @IsIdExist({ entity: 'user' }, { message: 'Mã người quản lý không tồn tại' })
    managerId: number;
}
