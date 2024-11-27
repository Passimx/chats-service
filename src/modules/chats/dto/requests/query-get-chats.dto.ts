import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryGetChatsDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    title!: string;

    @ApiPropertyOptional()
    @IsPositive()
    @IsNumber()
    @IsOptional()
    limit!: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    offset!: number;
}
