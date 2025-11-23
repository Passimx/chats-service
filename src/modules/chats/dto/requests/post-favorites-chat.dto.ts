import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ChatDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Id chat' })
    readonly name!: string;

    @IsNumber()
    @IsInt()
    @ApiProperty({ description: 'Number last message' })
    readonly lastMessage!: number;

    @ApiProperty({ description: 'MaxUsersOnline message' })
    @IsNumber()
    @IsInt()
    readonly maxUsersOnline!: number;
}

export class FavoriteChatsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChatDto)
    @ApiProperty({ type: [ChatDto] })
    readonly chats!: ChatDto[];
}
