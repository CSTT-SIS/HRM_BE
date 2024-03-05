import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { SHIFT_TYPE } from '~/common/enums/enum';

export class CreateShiftDto {
    @ApiProperty({ type: 'string', enum: SHIFT_TYPE, description: 'Loại ca' })
    @IsEnum(SHIFT_TYPE)
    type: SHIFT_TYPE;

    @ApiProperty({ type: 'string', format: 'date-time', description: 'Thời gian bắt đầu', required: false })
    @IsOptional()
    @IsDateString()
    startTime: Date;

    @ApiProperty({ type: 'string', format: 'date-time', description: 'Thời gian kết thúc', required: false })
    @IsOptional()
    @IsDateString()
    endTime: Date;

    @ApiProperty({ type: 'string', format: 'date-time', description: 'Thời gian nghỉ từ', required: false })
    @IsOptional()
    @IsDateString()
    breakFrom: Date;

    @ApiProperty({ type: 'string', format: 'date-time', description: 'Thời gian nghỉ đến', required: false })
    @IsOptional()
    @IsDateString()
    breakTo: Date;

    @ApiProperty({ type: 'number', description: 'Hệ số lương', required: false })
    @IsOptional()
    @IsInt()
    wageRate: number;

    @ApiProperty({ type: 'number', description: 'Tổng số giờ', required: false })
    @IsOptional()
    @IsInt()
    totalHours: number;

    @ApiProperty({ type: 'string', description: 'Ghi chú', required: false })
    @IsOptional()
    @IsString()
    note: string;

    @ApiProperty({ type: 'boolean', description: 'Hoạt động' })
    @IsOptional()
    @IsBoolean()
    isActive: boolean;
}
