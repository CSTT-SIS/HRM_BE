import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateForgottenTimekeepingDto {
    @ApiProperty({ type: 'string', description: 'Lý do', required: true })
    @IsNotEmpty({ message: 'Lý do không được để trống' })
    @Length(1, 255, { message: 'Lý do phải từ 1-255 ký tự' })
    reason: string;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày yêu cầu', required: false })
    @IsOptional()
    @IsDateString()
    requestDate: Date;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày quên chấm công', required: false })
    @IsOptional()
    @IsDateString()
    forgetDate: Date;

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
    supportingDocuments: Array<Express.Multer.File>;

    @ApiProperty({ type: 'string', description: 'Ghi chú', required: false })
    @IsOptional()
    @IsString()
    comments: string;

    @ApiProperty({ type: 'number', description: 'Id nhân viên yêu cầu', required: false })
    @IsOptional()
    @IsIdExist({ entity: 'user' }, { message: 'Id nhân viên không tồn tại' })
    userId: number;
}
