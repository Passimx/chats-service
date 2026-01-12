import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInteger } from '../../decorators/is-integer.decorator';

export class QueryGetChatsDto {
    @ApiPropertyOptional({ description: 'Chat name' })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    readonly search?: string;

    @ApiPropertyOptional({ description: 'Limit chat' })
    @IsInteger()
    @IsOptional()
    readonly limit?: number;

    @ApiPropertyOptional({ description: 'Offset chat' })
    @IsInteger()
    @IsOptional()
    readonly offset?: number;

    @ApiPropertyOptional({ description: 'chat ids' })
    @IsOptional()
    @IsUUID('all', { each: true })
    readonly chatIds?: string[];
}
