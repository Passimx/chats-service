import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDefined, IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class KeyDto {
    @ApiProperty({ description: 'Публичный ключ', maxLength: 2 ** 6 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2 ** 6)
    readonly userId!: string;

    @ApiProperty({ description: 'Зашифрованный ключ шифрования для чата', maxLength: 2 ** 13 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2 ** 13)
    readonly encryptionKey!: string;
}

export class KeepKeyDto {
    @ApiProperty({ isArray: true, type: () => KeyDto })
    @Type(() => KeyDto)
    @IsArray()
    @ValidateNested({ each: true })
    @IsDefined()
    readonly keys!: KeyDto[];
}
