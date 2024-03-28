import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateLetterDto {
    @ApiProperty({ type: 'string', description: 'Loại đơn', required: false })
    @IsOptional()
    @IsString()
    type: string;

    @ApiProperty({ type: 'string', description: 'Lý do', required: true })
    @IsNotEmpty({ message: 'Lý do không được để trống' })
    @Length(1, 255, { message: 'Lý do phải từ 1-255 ký tự' })
    reason: string;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày bắt đầu', required: false })
    @IsOptional()
    @IsDateString()
    startDay: Date;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày kết thúc', required: false })
    @IsOptional()
    @IsDateString()
    endDay: Date;

    @ApiProperty({ type: 'string', description: 'Ghi chú', required: false })
    @IsOptional()
    @IsString()
    comments: string;

    @ApiProperty({ type: 'number', description: 'Id nhân viên', required: false })
    @IsOptional()
    @IsIdExist({ entity: 'user' }, { message: 'Id nhân viên không tồn tại' })
    userId: number;
}
