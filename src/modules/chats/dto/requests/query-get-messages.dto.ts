import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class QueryGetMessagesDto {
    @ApiPropertyOptional()
    @IsNumber()
    @IsPositive()
    chatId!: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @IsPositive()
    limit!: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @IsPositive()
    offset!: number;

    @IsNumber()
    @ApiProperty()
    @IsOptional()
    @IsPositive()
    readonly parentMessageId!: number;

    @IsString()
    @ApiProperty()
    @IsOptional()
    search!: string;
}
