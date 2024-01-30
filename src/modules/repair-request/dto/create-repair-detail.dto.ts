import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateRepairDetailDto {
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
