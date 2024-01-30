import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateStocktakeDetailDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Mã sản phẩm không được để trống' })
    @IsNumber({}, { message: 'Mã sản phẩm phải là số' })
    @IsIdExist({ entity: 'product' }, { message: 'Mã sản phẩm không tồn tại' })
    productId: number;
}
