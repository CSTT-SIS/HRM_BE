import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { HOLIDAY_TYPE } from '~/common/enums/enum';

export class CreateHolidayDto {
    @ApiProperty({ enum: HOLIDAY_TYPE, description: 'Loại ngày nghỉ', required: true })
    @IsNotEmpty()
    holidayType: HOLIDAY_TYPE;

    @ApiProperty({ type: 'string', description: 'Mô tả', required: false })
    @IsOptional()
    description: string;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày bắt đầu', required: true })
    @IsNotEmpty()
    @IsDateString()
    startDay: Date;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày kết thúc', required: true })
    @IsNotEmpty()
    @IsDateString()
    endDay: Date;
}
