import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class ImportGoodDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Vui lòng chọn sản phẩm' })
    @IsIdExist({ entity: 'product' }, { message: 'Mã sản phẩm không tồn tại' })
    productId: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Vui lòng nhập số lượng' })
    @IsNumber({}, { message: 'Số lượng phải là số' })
    @Min(1, { message: 'Số lượng phải lớn hơn 0' })
    quantity: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber({}, { message: 'Số lượng sai số phải là số' })
    errorQuantity?: number;

    @ApiProperty()
    @IsOptional()
    @IsString({ message: 'Ghi chú phải là chuỗi' })
    note?: string;

    @ApiProperty()
    @IsOptional()
    @Matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, { message: 'Ngày hết hạn dự kiến không đúng định dạng YYYY-MM-DD HH:mm:ss' })
    expiredDate: Date;
}
