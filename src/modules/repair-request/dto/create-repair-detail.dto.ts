import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateRepairDetailDto {
    @ApiProperty()
    @IsOptional()
    @IsString({ message: 'Linh kiện hỏng phải là chuỗi' })
    brokenPart: string;

    @ApiProperty()
    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi' })
    description: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Mã linh kiện không được để trống' })
    @IsNumber({}, { message: 'Mã linh kiện phải là số' })
    @IsIdExist({ entity: 'product' }, { message: 'Mã linh kiện không tồn tại' })
    replacementPartId: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    @IsNumber({}, { message: 'Số lượng phải là số' })
    quantity: number;
}
