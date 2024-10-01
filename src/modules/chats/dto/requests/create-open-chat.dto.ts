import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateOpenChatDto {
    @ApiProperty()
    @IsString()
    title!: string;
}
