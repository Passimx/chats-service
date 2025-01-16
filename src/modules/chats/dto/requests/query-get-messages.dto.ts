import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { IsInteger } from '../../decorators/is-integer.decorator';

export class QueryGetMessagesDto {
    @ApiProperty({ description: 'Chat id' })
    @IsNotEmpty()
    @IsUUID('4')
    readonly chatId!: string;

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
