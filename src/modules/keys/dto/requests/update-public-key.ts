import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePublicKey {
    @ApiPropertyOptional({ maxLength: 32 })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(32)
    readonly name?: string;
}
