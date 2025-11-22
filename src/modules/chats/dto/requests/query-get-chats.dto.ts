import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInteger } from '../../decorators/is-integer.decorator';

export class QueryGetChatsDto {
    @ApiProperty({ description: 'Chat name' })
    @IsString()
    @IsNotEmpty()
    readonly search?: string;

    @ApiPropertyOptional({ description: 'Limit chat' })
    @IsInteger()
    @IsOptional()
    readonly limit?: number;

    @ApiPropertyOptional({ description: 'Offset chat' })
    @IsInteger()
    @IsOptional()
    readonly offset?: number;

    @IsUUID('all', { each: true })
    @IsArray()
    @IsOptional()
    @Transform(({ value }: { value: string }) => value.split(','))
    @ApiPropertyOptional({
        isArray: true,
        type: String,
    })
    readonly notFavoriteChatIds?: string[];
}
