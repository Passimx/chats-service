import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOpenChatDto {
    @ApiProperty({ description: 'title', minLength: 3, maxLength: 64 })
    @IsString()
    @MinLength(4)
    @MaxLength(64)
    readonly title!: string;
}
