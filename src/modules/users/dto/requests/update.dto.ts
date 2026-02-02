import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateDto {
    @ApiProperty()
    @MaxLength(2 ** 5)
    @MinLength(2)
    @IsString()
    readonly name?: string;
}
