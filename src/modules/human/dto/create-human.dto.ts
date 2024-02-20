import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateHumanDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Họ tên không được để trống' })
    @Length(1, 255, { message: 'Tên phải từ 1-255 ký tự' })
    fullName: string;

    @ApiProperty()
    @IsOptional()
    avatar: string;

    @ApiProperty()
    @IsOptional()
    birthDay: Date;

    @ApiProperty()
    @IsOptional()
    address: string;

    @ApiProperty()
    @IsOptional()
    description: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber({}, { message: 'Giới tính phải là số' })
    sex: number;

    @ApiProperty()
    @IsOptional()
    identity: string;

    @ApiProperty()
    @IsOptional()
    phoneNumber: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string;

    @ApiProperty()
    @IsOptional()
    degree: string;

    @ApiProperty()
    @IsOptional()
    @IsIdExist({ entity: 'department' }, { message: 'Id phòng ban không tồn tại' })
    departmentId: number;

    @ApiProperty()
    @IsOptional()
    passportExpired: Date;
}
