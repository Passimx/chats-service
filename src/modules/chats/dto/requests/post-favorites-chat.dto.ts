import { IsArray, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FavoriteChatsDto {
    // @IsNumber({}, { each: true })
    @IsArray()
    @ApiPropertyOptional()
    @IsOptional()
    favoriteChatIds!: number[];
}
