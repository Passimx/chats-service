import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class FavoriteChat {
    @IsUUID('4')
    @ApiProperty()
    chatId!: string;

    @IsInt()
    @Min(0)
    @ApiProperty()
    lastReadMessageNumber!: number;
}

export class FavoriteChatsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FavoriteChat)
    @ApiProperty()
    readonly chatsMap!: { chatId: string; lastReadMessageNumber: number }[];
}
