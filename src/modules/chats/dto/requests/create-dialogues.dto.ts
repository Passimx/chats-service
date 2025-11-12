import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDialoguesDto {
    @ApiProperty({ description: 'Свой публичный ключ' })
    @IsString()
    @IsNotEmpty()
    readonly senderPublicKey!: string;

    @ApiProperty({ description: 'Публичный ключ опанента' })
    @IsString()
    @IsNotEmpty()
    readonly recipientPublicKey!: string;

    @ApiProperty({ description: 'Общий ключ шифрования' })
    @IsString()
    @IsNotEmpty()
    readonly encryptionKey!: string;
}
