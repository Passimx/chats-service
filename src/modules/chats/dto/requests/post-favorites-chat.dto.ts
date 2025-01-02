import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageEntity } from '../../entities/message.entity';

export type FavoriteChats = { chatId: string; lastMessage: MessageEntity }[];

export class FavoriteChatsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @ApiProperty()
    readonly chats!: { chatId: string; lastMessage: number }[];
}
