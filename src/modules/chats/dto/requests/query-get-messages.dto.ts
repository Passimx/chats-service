import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsInteger } from '../../decorators/is-integer.decorator';

export class QueryGetMessagesDto {
    @IsInteger()
    @ApiProperty()
    chatId!: number;

    @ApiPropertyOptional({ description: 'Limit message' })
    @IsInteger()
    @IsOptional()
    limit!: number;

    @ApiPropertyOptional({ description: 'Offset message' })
    @IsOptional()
    @IsInteger()
    offset!: number;

    @IsString()
    @ApiPropertyOptional({ description: 'Search message' })
    @IsOptional()
    search!: string;
}
