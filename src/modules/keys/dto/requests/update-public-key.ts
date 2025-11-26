import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class UpdatePublicKey {
    @ApiPropertyOptional({ type: 'object' })
    @IsOptional()
    @IsObject()
    readonly metadata?: Record<string, any>;
}
