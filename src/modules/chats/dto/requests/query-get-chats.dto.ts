import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInteger } from '../../decorators/is-integer.decorator';

export class QueryGetChatsDto {
    @ApiPropertyOptional({ description: 'Chat name' })
    @IsString()
    @IsOptional()
    readonly title!: string;

    @ApiPropertyOptional({ description: 'Limit chat' })
    @IsInteger()
    @IsOptional()
    readonly limit!: number;

    @ApiPropertyOptional({ description: 'Offset chat' })
    @IsInteger()
    @IsOptional()
    readonly offset!: number;

    @IsUUID('4', { each: true })
    @IsArray()
    @IsOptional()
    @Transform(({ value }: { value: string }) => value.split(','))
    @ApiPropertyOptional({
        isArray: true,
        type: String,
    })
    readonly notFavoriteChatIds!: string[];
}
