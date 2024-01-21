import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProposalDetailDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Sản phẩm không được để trống' })
    @IsNumber({}, { message: 'Sản phẩm phải là số' })
    productId: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    @IsNumber({}, { message: 'Số lượng phải là số' })
    @Min(1, { message: 'Số lượng phải lớn hơn 0' })
    quantity: number;

    @ApiProperty()
    @IsOptional()
    @IsString({ message: 'Ghi chú phải là dạng chuỗi' })
    note?: string;
}
