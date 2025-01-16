import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOpenChatDto {
    @ApiProperty({ description: 'Chat name' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @Transform(({ value }: { value: string }) => value.slice(0, 1).toUpperCase() + value.slice(1))
    readonly title!: string;
}
