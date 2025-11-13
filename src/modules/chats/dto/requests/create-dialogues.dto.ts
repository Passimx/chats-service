import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDefined, IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDialogueKeyDto {
    @ApiProperty({ description: 'Публичный ключ' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    readonly publicKeyHash!: string;

    @ApiProperty({ description: 'Зашифрованный общий ключ шифрования для чата' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(8192)
    readonly encryptionKey!: string;
}

export class CreateDialoguesDto {
    @ApiProperty({ isArray: true, type: () => CreateDialogueKeyDto })
    @Type(() => CreateDialogueKeyDto)
    @IsArray()
    @ValidateNested({ each: true })
    @IsDefined()
    readonly keys!: CreateDialogueKeyDto[];
}
