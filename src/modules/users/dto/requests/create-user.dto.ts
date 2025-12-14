import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty()
    @MaxLength(2 ** 5)
    @MinLength(2)
    @IsString()
    readonly name?: string;

    @ApiProperty()
    @MaxLength(2 ** 12)
    @MinLength(2 ** 9)
    @IsString()
    readonly rsaPublicKey!: string;

    @ApiProperty()
    @MaxLength(2 ** 14)
    @MinLength(2 ** 10)
    @IsString()
    readonly encryptedRsaPrivateKey!: string;

    @ApiProperty()
    @MinLength(2 ** 4)
    @MaxLength(2 ** 6)
    readonly passwordHash!: string;

    @ApiProperty()
    @MinLength(2 ** 4)
    @MaxLength(2 ** 6)
    readonly seedPhraseHash!: string;
}
