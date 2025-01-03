import { IsArray, IsInt, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MessageEntity } from '../../entities/message.entity';

export type FavoriteChats = { chatId: string; lastMessage: MessageEntity };
export type ChatsDto = { chatId: string; lastMessage: number };

export class FavoriteChat {
    @IsString()
    @ApiProperty({ description: 'Id chat' })
    chatId!: string;

    @ValidateNested()
    @Type(() => MessageEntity)
    @ApiProperty({ type: MessageEntity })
    lastMessage!: MessageEntity;
}

class ChatDto {
    @IsString()
    @ApiProperty({ description: 'Id chat' })
    chatId!: string;

    @IsNumber()
    @IsInt()
    @ApiProperty({ description: 'Number last message' })
    lastMessage!: number;
}

export class FavoriteChatsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChatDto)
    @ApiProperty({ type: [ChatDto] })
    readonly chats!: ChatDto[];
}
