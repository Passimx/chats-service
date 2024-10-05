import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
    @IsString()
    @ApiProperty()
    readonly encryptMessage!: string;

    @IsNumber()
    @ApiProperty()
    readonly chatId!: number;
}
