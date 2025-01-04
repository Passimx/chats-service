import { IsArray, IsInt, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MessageEntity } from '../../entities/message.entity';

export type ChatsDto = { chatId: string; lastMessage: number };

export class FavoriteChat {
    @IsString()
    @ApiProperty({ description: 'Id chat' })
    readonly chatId!: string;

    @ValidateNested()
    @Type(() => MessageEntity)
    @ApiProperty({ type: MessageEntity })
    readonly lastMessage!: MessageEntity;

    constructor(chatId: string, lastMessage: MessageEntity) {
        this.chatId = chatId;
        this.lastMessage = lastMessage;
    }
}

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
