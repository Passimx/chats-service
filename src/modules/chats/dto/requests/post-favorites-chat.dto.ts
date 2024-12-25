import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FavoriteChatsDto {
    @IsUUID('4', { each: true })
    @IsArray()
    @ApiProperty({
        isArray: true,
        type: Number,
    })
    favoriteChatIds!: string[];
}
