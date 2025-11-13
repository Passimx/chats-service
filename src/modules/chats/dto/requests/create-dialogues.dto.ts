import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDialoguesDto {
    @ApiProperty({ description: 'Публичный ключ создателя' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    readonly senderPublicKeyHash!: string;

    @ApiProperty({ description: 'Публичный ключ оппонента' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    readonly recipientPublicKeyHash!: string;

    @ApiProperty({ description: 'Зашифрованный общий ключ шифрования для чата' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(8192)
    readonly encryptionKey!: string;
}
