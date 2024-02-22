import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { EMPLOYEE_LEAVE_REQUEST_STATUS } from '~/common/enums/enum';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateLetterDto {
    @ApiProperty({ type: 'string', description: 'Lý do', required: true })
    @IsNotEmpty({ message: 'Lý do không được để trống' })
    @Length(1, 255, { message: 'Lý do phải từ 1-255 ký tự' })
    reason: string;

    @ApiProperty({ type: 'string', description: 'Ngày bắt đầu', required: false })
    @IsOptional()
    @IsString()
    startDay: Date;

    @ApiProperty({ type: 'string', description: 'Ngày kết thúc', required: false })
    @IsOptional()
    @IsString()
    endDay: Date;

    @ApiProperty({ enum: EMPLOYEE_LEAVE_REQUEST_STATUS, description: 'Trạng thái', required: false })
    @IsOptional()
    @IsNumber()
    status: EMPLOYEE_LEAVE_REQUEST_STATUS;

    @ApiProperty({ type: 'number', description: 'Id người duyệt đơn', required: false })
    @IsOptional()
    @IsIdExist({ entity: 'staff' }, { message: 'Id người duyệt đơn không tồn tại' })
    approverId: number;

    @ApiProperty({ type: 'string', description: 'Ngày duyệt', required: false })
    @IsOptional()
    @IsString()
    approverDate: Date;

    @ApiProperty({ type: 'string', description: 'Ghi chú', required: false })
    @IsOptional()
    @IsString()
    comments: string;

    @ApiProperty({ type: 'number', description: 'Id nhân viên', required: false })
    @IsOptional()
    @IsIdExist({ entity: 'staff' }, { message: 'Id nhân viên không tồn tại' })
    staffId: number;
}
