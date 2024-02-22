import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Length } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateHumanDto {
    @ApiProperty({ type: 'string', description: 'Mã nhân sự', required: true })
    @IsNotEmpty({ message: 'Mã nhân sự không được để trống' })
    @Length(1, 255, { message: 'Mã nhân sự phải từ 1-255 ký tự' })
    code: string;

    @ApiProperty({ type: 'string', description: 'Họ tên nhân sự', required: true })
    @IsNotEmpty({ message: 'Họ tên không được để trống' })
    @Length(1, 255, { message: 'Tên phải từ 1-255 ký tự' })
    fullName: string;

    @ApiProperty({ type: 'string', format: 'binary', description: 'Ảnh đại diện', required: false })
    @IsOptional()
    avatar: Express.Multer.File;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày sinh', required: false })
    @IsOptional()
    @IsDateString()
    birthDay: Date;

    @ApiProperty({ type: 'string', description: 'Địa chỉ', required: false })
    @IsOptional()
    address: string;

    @ApiProperty({ type: 'string', description: 'Mô tả', required: false })
    @IsOptional()
    description: string;

    @ApiProperty({ type: 'string', description: 'Email', required: true })
    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @ApiProperty({ type: 'number', description: 'Giới tính', required: false })
    @IsOptional()
    @IsNumberString({}, { message: 'Giới tính phải là số' })
    sex: number;

    @ApiProperty({ type: 'string', description: 'Số CCCD hoặc CMND', required: false })
    @IsOptional()
    identity: string;

    @ApiProperty({ type: 'string', description: 'Số điện thoại', required: false })
    @IsOptional()
    phoneNumber: string;

    @ApiProperty({ type: 'string', description: 'Mật khẩu', required: true })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string;

    @ApiProperty({ type: 'string', description: 'Bằng cấp', required: false })
    @IsOptional()
    degree: string;

    @ApiProperty({ type: 'number', description: 'Id phòng ban', required: false })
    @IsOptional()
    @IsIdExist({ entity: 'department' }, { message: 'Id phòng ban không tồn tại' })
    departmentId: number;

    @ApiProperty({ type: 'string', description: 'Thời hạn hộ chiếu', required: false })
    @IsOptional()
    @IsString()
    passportExpired: Date;
}
