import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryGetChatsDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    title!: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    limit!: number;
}
