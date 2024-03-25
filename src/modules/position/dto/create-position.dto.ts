import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreatePositionDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Tên chức vụ không được để trống' })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Mã chức vụ không được để trống' })
    code: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Tên nhóm chức vụ không được để trống' })
    groupPosition: string;

    @ApiProperty({ type: 'boolean', description: 'Hoạt động' })
    @IsBoolean()
    isActive: boolean;

    @ApiProperty()
    @IsOptional()
    description: string;
}
