import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageEntity } from '../../entities/message.entity';

export type FavoriteChats = { chatId: string; lastMessage: MessageEntity };
export type ChatsDto = { chatId: string; lastMessage: number };

class ChatDto {
    @IsString()
    @ApiProperty({ description: 'Id chat' })
    chatId!: string;

    @IsNumber()
    @ApiProperty({ description: 'Number last message' })
    lastMessage!: number;
}

export class FavoriteChatsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @ApiProperty({ type: [ChatDto] })
    readonly chats!: ChatDto[];
}
