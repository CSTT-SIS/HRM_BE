import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumberString, IsOptional, IsString, Length } from 'class-validator';
import { OVERTIME_REQUEST_STATUS } from '~/common/enums/enum';

export class UpdateOverTimeDto {
    @ApiProperty({ type: 'string', description: 'Lý do', required: true })
    @IsNotEmpty({ message: 'Lý do không được để trống' })
    @Length(1, 255, { message: 'Lý do phải từ 1-255 ký tự' })
    reason: string;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày yêu cầu', required: true })
    @IsNotEmpty()
    @IsDateString()
    requestDate: Date;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày làm thêm', required: true })
    @IsNotEmpty()
    @IsDateString()
    overtimeDate: Date;

    @ApiProperty({ type: 'number', description: 'Số giờ làm thêm', required: true })
    @IsNotEmpty()
    @IsNumberString()
    overtimeHours: number;

    @ApiProperty({ type: 'number', description: 'Mức lương làm thêm giờ', required: true })
    @IsNotEmpty()
    @IsNumberString()
    overtimeRate: string;

    @ApiProperty({ type: 'number', description: 'Tổng số tiền làm thêm giờ', required: true })
    @IsNotEmpty()
    @IsNumberString()
    overtimeAmount: string;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'string',
            format: 'binary',
        },
        description: 'Tài liệu đính kèm',
        required: false,
    })
    @IsOptional()
    supportingDocuments: string;

    @ApiProperty({ type: 'string', description: 'Ghi chú', required: false })
    @IsOptional()
    @IsString()
    comments: string;

    @ApiProperty({ enum: OVERTIME_REQUEST_STATUS, description: 'Trạng thái', required: false })
    @IsOptional()
    @IsString()
    status: OVERTIME_REQUEST_STATUS;
}
