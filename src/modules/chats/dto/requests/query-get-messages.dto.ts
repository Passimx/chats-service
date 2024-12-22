import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsInteger } from '../../decorators/is-integer.decorator';

export class QueryGetMessagesDto {
    @IsInteger()
    @ApiProperty()
    readonly chatId!: number;

    @ApiPropertyOptional({ description: 'Limit message' })
    @IsInteger()
    @IsOptional()
    readonly limit!: number;

    @ApiPropertyOptional({ description: 'Offset message' })
    @IsOptional()
    @IsInteger()
    readonly offset!: number;

    @IsString()
    @ApiPropertyOptional({ description: 'Search message' })
    @IsOptional()
    readonly search!: string;
}
