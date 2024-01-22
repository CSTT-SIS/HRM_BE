import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStocktakeDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Tên phiếu kiểm kê không được để trống' })
    @IsString({ message: 'Tên phiếu kiểm kê phải là chuỗi' })
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi' })
    description: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
    startDate: Date;

    @ApiProperty()
    @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
    endDate: Date;

    @ApiProperty({ type: [Number] })
    @IsNotEmpty({ message: 'Danh sách người tham gia không được để trống' })
    @IsArray({ message: 'Danh sách người tham gia phải là mảng' })
    participants: number[];
}
