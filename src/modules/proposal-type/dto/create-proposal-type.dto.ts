import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateProposalTypeDto {
    @ApiProperty({ name: 'name', description: 'Tên loại phiếu đề nghị', example: 'Yêu cầu mua hàng' })
    @IsNotEmpty({ message: 'Vui lòng nhập tên loại phiếu đề nghị' })
    @IsString({ message: 'Vui lòng nhập chuỗi ký tự' })
    @Length(1, 255, { message: 'Tên phải từ 1-255 ký tự' })
    name: string;

    @ApiProperty({ name: 'description', description: 'Mô tả loại phiếu đề nghị', example: 'Yêu cầu mua hàng' })
    @IsOptional()
    @IsString({ message: 'Vui lòng nhập chuỗi ký tự' })
    description: string;
}
