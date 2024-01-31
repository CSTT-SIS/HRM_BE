import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt } from 'class-validator';

export class FilterDto {
    @ApiProperty({ required: false, type: Number, default: 1 })
    @IsInt()
    @Transform(({ value }) => parseInt(value))
    page: number;

    @ApiProperty({ required: false, type: Number, default: 10 })
    @IsInt()
    @Transform(({ value }) => parseInt(value))
    perPage: number;

    @ApiProperty({ required: false, default: 'id.ASC' })
    sortBy: string;

    @ApiProperty({ required: false })
    search: string;
}
