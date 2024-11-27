import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsInteger } from '../../decorators/is-integer.decorator';

export class CreateMessageDto {
    @IsString()
    @ApiProperty()
    @Length(1, 163824)
    @IsOptional()
    readonly encryptMessage?: string;

    @IsNotEmpty()
    @IsInteger()
    @ApiProperty()
    readonly chatId!: number;

    @IsString()
    @ApiProperty()
    @Length(1, 163824)
    @IsOptional()
    readonly message?: string;

    @IsInteger()
    @ApiProperty()
    @IsOptional()
    readonly parentMessageId?: number;
}
