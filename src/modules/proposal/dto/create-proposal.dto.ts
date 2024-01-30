import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { PROPOSAL_TYPE } from '~/common/enums/enum';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateProposalDto {
    @ApiProperty({ type: 'enum', enum: PROPOSAL_TYPE })
    @IsNotEmpty({ message: 'Loại đề xuất không được để trống' })
    @IsString({ message: 'Loại đề xuất phải là dạng chuỗi' })
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

    @ApiProperty()
    @IsOptional()
    @IsNumber({}, { message: 'Mã yêu cầu sửa chữa phải là dạng số' })
    @IsIdExist({ entity: 'repairRequest' }, { message: 'Mã yêu cầu sửa chữa không tồn tại' })
    repairRequestId: number;
}
