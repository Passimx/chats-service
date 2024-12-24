import { IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FavoriteChatsDto {
    @IsInt({ each: true })
    @IsArray()
    @ApiProperty({
        isArray: true,
        type: Number,
    })
    favoriteChatIds!: string[];
}
