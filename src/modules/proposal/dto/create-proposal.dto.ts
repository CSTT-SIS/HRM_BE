import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProposalDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Loại đề xuất không được để trống' })
    @IsNumber({}, { message: 'Loại đề xuất phải là số' })
    typeId: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Tên đề xuất không được để trống' })
    @IsString({ message: 'Tên đề xuất phải là dạng chuỗi' })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Nội dung đề xuất không được để trống' })
    @IsString({ message: 'Nội dung đề xuất phải là dạng chuỗi' })
    content: string;
}
