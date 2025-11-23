import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetPublicKeyDto {
    @ApiProperty({ maxLength: 128 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(128)
    readonly name!: string;
}
