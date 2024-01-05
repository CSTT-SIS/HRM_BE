import { ApiProperty } from '@nestjs/swagger';

export class FilterDto {
    @ApiProperty({ required: false, default: 1 })
    page: number;

    @ApiProperty({ required: false, default: 10 })
    perPage: number;

    @ApiProperty({ required: false, default: 'id.ASC' })
    sortBy: string;

    @ApiProperty({ required: false })
    search: string;
}
