import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInteger } from '../../decorators/is-integer.decorator';

export class QueryGetChatsDto {
    @ApiProperty({ description: 'Chat name' })
    @IsString()
    @IsNotEmpty()
    readonly title?: string;

    @ApiPropertyOptional({ description: 'Limit chat' })
    @IsInteger()
    @IsOptional()
    readonly limit?: number;

    @ApiPropertyOptional({ description: 'Offset chat' })
    @IsInteger()
    @IsOptional()
    readonly offset?: number;

    @IsUUID('4', { each: true })
    @IsArray()
    @IsOptional()
    @Transform(({ value }: { value: string }) => value.split(','))
    @ApiPropertyOptional({
        isArray: true,
        type: String,
    })
    readonly notFavoriteChatIds?: string[];
}
