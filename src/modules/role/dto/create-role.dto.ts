import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsOptional()
    description: string;

    @ApiProperty({
        type: [Number],
    })
    @IsOptional()
    permissionIds: number[];
}
