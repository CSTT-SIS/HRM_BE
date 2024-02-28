import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { PROPOSAL_TYPE } from '~/common/enums/enum';

export class CreateProposalDto {
    @ApiProperty({ type: 'enum', enum: PROPOSAL_TYPE })
    @IsNotEmpty({ message: 'Loại yêu cầu không được để trống' })
    @IsEnum(PROPOSAL_TYPE, { message: 'Loại yêu cầu không hợp lệ' })
    type: PROPOSAL_TYPE;

    @ApiProperty()
    @IsNotEmpty({ message: 'Tên yêu cầu không được để trống' })
    @IsString({ message: 'Tên yêu cầu phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Tên phải từ 1-255 ký tự' })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Nội dung yêu cầu không được để trống' })
    @IsString({ message: 'Nội dung yêu cầu phải là dạng chuỗi' })
    content: string;
}
