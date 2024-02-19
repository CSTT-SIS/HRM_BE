import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Length, ValidateIf } from 'class-validator';
import { PROPOSAL_TYPE } from '~/common/enums/enum';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

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

    @ApiProperty()
    @ValidateIf((o) => o.type === PROPOSAL_TYPE.REPAIR)
    @IsNotEmpty({ message: 'Mã yêu cầu sửa chữa không được để trống' })
    @IsNumber({}, { message: 'Mã yêu cầu sửa chữa phải là dạng số' })
    @IsIdExist({ entity: 'repairRequest' }, { message: 'Mã yêu cầu sửa chữa không tồn tại' })
    repairRequestId: number;
}
