import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreatePositionGroupDto {
    @ApiProperty({ type: 'string', description: 'Tên nhóm quyền', required: true })
    @IsNotEmpty({ message: 'Tên nhóm quyền không được để trống' })
    @Length(1, 255, { message: 'Tên nhóm quyền phải từ 1-255 ký tự' })
    name: string;

    @ApiProperty({ type: 'string', description: 'Mô tả', required: false })
    @IsOptional()
    description: string;
}
