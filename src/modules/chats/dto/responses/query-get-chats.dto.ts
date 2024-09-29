import { IsNumber, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryGetChatsDto {
    @ApiPropertyOptional()
    @IsString()
    title!: string;

    @ApiPropertyOptional()
    @IsNumber()
    limit?: number;
}
