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

    @ApiProperty({ type: 'string', format: 'binary', description: 'Ảnh đại diện', required: true })
    @IsOptional()
    avatar: Express.Multer.File;

    @ApiProperty({ type: 'string', description: 'Email', required: true })
    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({}, { message: 'Địa chỉ email không hợp lệ' })
    email: string;

    @ApiProperty({ type: 'string', description: 'Số điện thoại', required: false })
    @IsOptional()
    phoneNumber: string;

    @ApiProperty({ type: 'string', description: 'Tên gọi khác', required: false })
    @IsOptional()
    anotherName: string;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày sinh', required: false })
    @IsOptional()
    @IsDateString()
    birthDay: Date;

    @ApiProperty({ type: 'number', description: 'Giới tính', required: false })
    @IsOptional()
    @IsNumberString({}, { message: 'Giới tính phải là số' })
    sex: number;

    @ApiProperty({ type: 'string', description: 'Số CCCD', required: false })
    @IsOptional()
    identityNumber: string;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày cấp CCCD', required: false })
    @IsOptional()
    @IsDateString()
    identityDate: Date;

    @ApiProperty({ type: 'string', description: 'Nơi cấp CCCD', required: false })
    @IsOptional()
    identityPlace: string;

    @ApiProperty({ type: 'string', description: 'Số hộ chiếu', required: false })
    @IsOptional()
    passportNumber: string;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày cấp hộ chiếu', required: false })
    @IsOptional()
    @IsDateString()
    passportDate: Date;

    @ApiProperty({ type: 'string', description: 'Nơi cấp hộ chiếu', required: false })
    @IsOptional()
    passportPlace: string;

    @ApiProperty({ type: 'string', description: 'Thời hạn hộ chiếu', required: false })
    @IsOptional()
    @IsDateString()
    passportExpired: Date;

    @ApiProperty({ type: 'string', description: 'Nơi sinh', required: false })
    @IsOptional()
    placeOfBirth: string;

    @ApiProperty({ type: 'string', description: 'Quốc gia', required: false })
    @IsOptional()
    nation: string;

    @ApiProperty({ type: 'string', description: 'Tỉnh thành phố', required: false })
    @IsOptional()
    provice: string;

    @ApiProperty({ type: 'string', description: 'Tôn giáo', required: false })
    @IsOptional()
    religion: string;

    @ApiProperty({ type: 'string', description: 'Tình trạng hôn nhân', required: false })
    @IsOptional()
    maritalStatus: string;

    @ApiProperty({ type: 'number', description: 'Id phòng ban', required: false })
    @IsOptional()
    @IsIdExist({ entity: 'department' }, { message: 'Id phòng ban không tồn tại' })
    departmentId: number;

    @ApiProperty({ type: 'number', description: 'Id chức vụ', required: false })
    @IsOptional()
    @IsIdExist({ entity: 'position' }, { message: 'Id chức vụ không tồn tại' })
    positionId: number;

    @ApiProperty({ type: 'number', description: 'Quản lý gián tiếp', required: false })
    @IsOptional()
    indirectSuperior: number;

    @ApiProperty({ type: 'number', description: 'Quản lý trực tiếp', required: false })
    @IsOptional()
    directSuperior: number;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày vào công ty', required: false })
    @IsOptional()
    @IsDateString()
    dateOfJoin: Date;

    @ApiProperty({ type: 'string', description: 'Mã số thuế', required: false })
    @IsOptional()
    taxCode: string;

    @ApiProperty({ type: 'string', description: 'Số tài khoản ngân hàng', required: false })
    @IsOptional()
    bankAccount: string;

    @ApiProperty({ type: 'string', description: 'Tên ngân hàng', required: false })
    @IsOptional()
    bankName: string;

    @ApiProperty({ type: 'string', description: 'Chi nhánh ngân hàng', required: false })
    @IsOptional()
    bankBranch: string;
}
