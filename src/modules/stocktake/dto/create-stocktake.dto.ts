import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateStocktakeDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Mã kho không được để trống' })
    @IsNumber({}, { message: 'Mã kho phải là số' })
    warehouseId: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Tên phiếu kiểm kê không được để trống' })
    @IsString({ message: 'Tên phiếu kiểm kê phải là chuỗi' })
    @Length(1, 255, { message: 'Tên phiếu kiểm kê phải từ 1-255 ký tự' })
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi' })
    description: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
    @Matches(/^(\d{4})-(\d{2})-(\d{2})$/, { message: 'Ngày bắt đầu không đúng định dạng YYYY-MM-DD' })
    startDate: Date;

    @ApiProperty()
    @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
    @Matches(/^(\d{4})-(\d{2})-(\d{2})$/, { message: 'Ngày kết thúc không đúng định dạng YYYY-MM-DD' })
    endDate: Date;

    @ApiProperty({ type: [Number] })
    @IsNotEmpty({ message: 'Danh sách người tham gia không được để trống' })
    @IsArray({ message: 'Danh sách người tham gia phải là mảng' })
    participants: number[];
}
