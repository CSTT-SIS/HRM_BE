import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { PROPOSAL_TYPE } from '~/common/enums/enum';

export class CreateProposalDto {
    @ApiProperty({ type: 'enum', enum: PROPOSAL_TYPE })
    @IsNotEmpty({ message: 'Loại đề xuất không được để trống' })
    @IsEnum(PROPOSAL_TYPE, { message: 'Loại đề xuất không hợp lệ' })
    type: PROPOSAL_TYPE;

    @ApiProperty()
    @IsNotEmpty({ message: 'Tên đề xuất không được để trống' })
    @IsString({ message: 'Tên đề xuất phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Tên phải từ 1-255 ký tự' })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Nội dung đề xuất không được để trống' })
    @IsString({ message: 'Nội dung đề xuất phải là dạng chuỗi' })
    content: string;
}
