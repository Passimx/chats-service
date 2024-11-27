import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsInteger } from '../../decorators/is-integer.decorator';

export class QueryGetMessagesDto {
    @IsInteger()
    @ApiProperty()
    chatId!: number;

    @ApiPropertyOptional()
    @IsInteger()
    @IsOptional()
    limit!: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInteger()
    offset!: number;

    @IsString()
    @ApiPropertyOptional()
    @IsOptional()
    search!: string;
}
