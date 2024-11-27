import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOpenChatDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title!: string;
}
