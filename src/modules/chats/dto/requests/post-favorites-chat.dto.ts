import { IsArray, IsInt, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export type ChatsDto = { chatId: string; lastMessage: number };

class ChatDto {
    @IsString()
    @ApiProperty({ description: 'Id chat' })
    readonly chatId!: string;

    @IsNumber()
    @IsInt()
    @ApiProperty({ description: 'Number last message' })
    readonly lastMessage!: number;
}

export class FavoriteChatsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChatDto)
    @ApiProperty({ type: [ChatDto] })
    readonly chats!: ChatDto[];
}
