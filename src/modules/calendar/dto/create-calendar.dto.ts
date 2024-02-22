import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { CALENDAR_TYPE } from '~/common/enums/enum';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateCalendarDto {
    @ApiProperty({ type: 'string', description: 'Nội dung', required: true })
    @IsNotEmpty({ message: 'Nội dung không được để trống' })
    @Length(1, 255, { message: 'Tên phải từ 1-255 ký tự' })
    content: string;

    @ApiProperty({ type: 'string', description: 'Mô tả', required: false })
    @IsOptional()
    description: string;

    @ApiProperty({ type: 'string', description: 'Thời gian', required: true })
    @IsString()
    time: Date;

    @ApiProperty({ enum: CALENDAR_TYPE, description: 'Loại lịch', required: true })
    @IsNumber()
    type: CALENDAR_TYPE;

    @ApiProperty({ type: 'number', description: 'Id phòng ban', required: false })
    @IsOptional()
    @IsIdExist({ entity: 'department' }, { message: 'Id phòng ban không tồn tại' })
    departmentId: number;

    @ApiProperty({ type: 'number', description: 'Id nhân viên', required: false })
    @IsOptional()
    @IsIdExist({ entity: 'staff' }, { message: 'Id nhân viên không tồn tại' })
    staffId: number;
}
