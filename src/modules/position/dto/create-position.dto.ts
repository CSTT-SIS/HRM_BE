import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreatePositionDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Tên chức vụ không được để trống' })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Mã chức vụ không được để trống' })
    code: string;

    @ApiProperty({ type: 'boolean', description: 'Hoạt động' })
    @IsBoolean()
    isActive: boolean;

    @ApiProperty()
    @IsOptional()
    description: string;

    @ApiProperty({ type: 'number', description: 'Id nhóm chức vụ', required: false })
    @IsOptional()
    @IsIdExist({ entity: 'positionGroup' }, { message: 'Id nhóm chức vụ không tồn tại' })
    positionGroupId: number;
}
