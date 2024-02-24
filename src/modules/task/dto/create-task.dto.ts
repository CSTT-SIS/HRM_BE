import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { TASK_PRIORITY } from '~/common/enums/enum';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateTaskDto {
    @ApiProperty({ type: 'string', description: 'Tên nhiệm vụ', required: true })
    @IsNotEmpty({ message: 'Tên nhiệm vụ không được để trống' })
    @Length(1, 255, { message: 'Tên nhiệm vụ phải từ 1-255 ký tự' })
    name: string;

    @ApiProperty({ type: 'string', description: 'Mô tả', required: false })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({ enum: TASK_PRIORITY, description: 'Độ ưu tiên của nhiệm vụ', required: false })
    @IsOptional()
    priority: TASK_PRIORITY;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày đến hạn', required: false })
    @IsOptional()
    @IsDateString()
    dueDate: Date;

    @ApiProperty({ type: 'number', description: 'Id nhân sự', required: true })
    @IsNotEmpty()
    @IsIdExist({ entity: 'user' }, { message: 'Id nhân sự không tồn tại' })
    assigneeId: number;

    @ApiProperty({ type: 'number', description: 'Người phối hợp', required: false })
    @IsNotEmpty()
    @IsIdExist({ entity: 'user' }, { message: 'Người phối hợp không tồn tại' })
    coordinatorId: number;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày bắt đầu', required: false })
    @IsOptional()
    @IsDateString()
    startDate: Date;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày kết thúc', required: false })
    @IsOptional()
    @IsDateString()
    endDate: Date;

    @ApiProperty({ type: 'string', description: 'Ghi chú', required: false })
    @IsOptional()
    @IsString()
    comments: string;
}
