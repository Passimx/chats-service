import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { PublicKeyMetadataType } from '../../types/public-key-metadata.type';

export class KeepPublicKeyDto {
    @ApiProperty({ maxLength: 4096 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(4096)
    readonly publicKey!: string;

    @ApiPropertyOptional({ type: 'object' })
    @IsOptional()
    @IsObject()
    readonly metadata!: PublicKeyMetadataType;
}
