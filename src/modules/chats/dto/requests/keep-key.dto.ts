import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDefined, IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class KeyDto {
    @ApiProperty({ description: 'Публичный ключ' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    readonly publicKeyHash!: string;

    @ApiProperty({ description: 'Зашифрованный ключ шифрования для чата' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(8192)
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
