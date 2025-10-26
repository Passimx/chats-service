import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDialoguesDto {
    @ApiProperty({ description: 'Свой публичный ключ' })
    @IsString()
    @IsNotEmpty()
    readonly your_public_key!: string;

    @ApiProperty({ description: 'Публичный ключ опанента' })
    @IsString()
    @IsNotEmpty()
    readonly his_public_key!: string;

    @ApiProperty({ description: 'Общий ключ шифрования' })
    @IsString()
    @IsNotEmpty()
    readonly encryption_key!: string;
}
