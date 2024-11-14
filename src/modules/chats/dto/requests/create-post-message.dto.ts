import { IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
    @IsString()
    @ApiProperty()
    @Length(1, 163824)
    @IsOptional()
    readonly encryptMessage?: string;

    @IsNumber()
    @ApiProperty()
    readonly chatId!: number;

    @IsString()
    @ApiProperty()
    @Length(1, 163824)
    @IsOptional()
    readonly message?: string;

    @IsNumber()
    @ApiProperty()
    @IsOptional()
    readonly parentMessageId!: number;
}
