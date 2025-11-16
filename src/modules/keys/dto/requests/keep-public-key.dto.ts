import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class KeepPublicKeyDto {
    @ApiProperty({ maxLength: 4096 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(4096)
    readonly publicKey!: string;
}
