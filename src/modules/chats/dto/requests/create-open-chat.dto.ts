import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOpenChatDto {
    @ApiProperty({ description: 'Chat name' })
    @IsString()
    @IsNotEmpty()
    title!: string;
}
