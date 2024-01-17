import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProposalDetailDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Sản phẩm không được để trống' })
    @IsNumber({}, { message: 'Sản phẩm phải là số' })
    productId: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    @IsNumber({}, { message: 'Số lượng phải là số' })
    quantity: number;

    @ApiProperty()
    @IsOptional()
    @IsString({ message: 'Ghi chú phải là dạng chuỗi' })
    note?: string;
}

export class CreateProposalDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Loại đề xuất không được để trống' })
    @IsNumber({}, { message: 'Loại đề xuất phải là số' })
    typeId: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Kho thực hiện đề xuất không được để trống' })
    @IsNumber({}, { message: 'Kho thực hiện đề xuất phải là số' })
    warehouseId: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Tên đề xuất không được để trống' })
    @IsString({ message: 'Tên đề xuất phải là dạng chuỗi' })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Nội dung đề xuất không được để trống' })
    @IsString({ message: 'Nội dung đề xuất phải là dạng chuỗi' })
    content: string;

    @ApiProperty({ type: [CreateProposalDetailDto] })
    @IsArray({ message: 'Chi tiết đề xuất phải là dạng mảng' })
    @IsNotEmpty({ message: 'Chi tiết đề xuất không được để trống' })
    details: CreateProposalDetailDto[];
}
