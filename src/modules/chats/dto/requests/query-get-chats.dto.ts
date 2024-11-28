import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInteger } from '../../decorators/is-integer.decorator';

export class QueryGetChatsDto {
    @ApiPropertyOptional({ description: 'Chat name' })
    @IsString()
    @IsOptional()
    title!: string;

    @ApiPropertyOptional({ description: 'Limit chat' })
    @IsInteger()
    @IsOptional()
    limit!: number;

    @ApiPropertyOptional({ description: 'Offset chat' })
    @IsInteger()
    @IsOptional()
    offset!: number;
}
