import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({ minLength: 2, maxLength: 2 ** 6 })
    @IsString()
    @MaxLength(2 ** 6)
    @MinLength(2)
    readonly userId!: string;

    @ApiProperty({ minLength: 2, maxLength: 2 ** 6 })
    @IsString()
    @MaxLength(2 ** 6)
    @MinLength(2)
    readonly passwordHash!: string;

    @ApiProperty({ minLength: 2, maxLength: 2 ** 6 })
    @IsString()
    @MaxLength(2 ** 6)
    @MinLength(2)
    readonly seedPhraseHash!: string;

    @ApiProperty({ minLength: 2, maxLength: 2 ** 6 })
    @IsString()
    @MaxLength(2 ** 12)
    @MinLength(2)
    readonly encryptionUserAgent!: string;
}
