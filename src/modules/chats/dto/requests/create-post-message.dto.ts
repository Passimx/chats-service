import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
    @IsString()
    @ApiProperty()
    @IsOptional()
    readonly encryptMessage!: string;

    @IsNumber()
    @ApiProperty()
    readonly chatId!: number;

    @IsString()
    @ApiProperty()
    @IsOptional()
    readonly message!: string;

    @IsNumber()
    @ApiProperty()
    @IsOptional()
    readonly parentMessageId!: number;
}
