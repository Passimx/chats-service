import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { IsInteger } from '../../decorators/is-integer.decorator';

export class QueryGetMessagesDto {
    @ApiProperty({ description: 'Chat id' })
    @IsNotEmpty()
    @IsUUID('all')
    readonly chatId!: string;

    @ApiPropertyOptional({ description: 'Limit message' })
    @IsInteger()
    @IsOptional()
    readonly limit!: number;

    @ApiPropertyOptional({ description: 'Offset message' })
    @IsOptional()
    @IsInteger()
    readonly offset!: number;
}
