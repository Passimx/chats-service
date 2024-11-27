import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInteger } from '../../decorators/is-integer.decorator';

export class QueryGetChatsDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    title!: string;

    @ApiPropertyOptional()
    @IsInteger()
    @IsOptional()
    limit!: number;

    @ApiPropertyOptional()
    @IsInteger()
    @IsOptional()
    offset!: number;
}
