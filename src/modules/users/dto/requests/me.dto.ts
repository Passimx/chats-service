import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class MeDto {
    @ApiProperty()
    @MaxLength(2 ** 6)
    @MinLength(2)
    @IsString()
    readonly id!: string;

    @ApiProperty()
    @IsString()
    @MaxLength(2 ** 6)
    @MinLength(2)
    @IsString()
    readonly seedPhraseHash!: string;
}
