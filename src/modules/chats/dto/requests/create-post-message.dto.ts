import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
    @IsString()
    @ApiProperty()
    @Length(1, 163824)
    @IsOptional()
    readonly encryptMessage?: string;

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    @IsNotEmpty()
    @ApiProperty()
    readonly chatId!: number;

    @IsString()
    @ApiProperty()
    @Length(1, 163824)
    @IsOptional()
    readonly message?: string;

    @IsNumber()
    @IsPositive()
    @ApiProperty()
    @IsOptional()
    readonly parentMessageId?: number;
}
