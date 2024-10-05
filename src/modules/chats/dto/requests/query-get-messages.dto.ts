import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class QueryGetMessagesDto {
    @ApiPropertyOptional()
    @IsNumber()
    chatId!: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    limit!: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    offset!: number;
}
