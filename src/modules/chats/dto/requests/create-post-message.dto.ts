import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInteger } from '../../decorators/is-integer.decorator';

export class CreateMessageDto {
    @IsString()
    @ApiPropertyOptional({
        description: 'Encrypt message',
        minLength: 1,
        maxLength: 32768,
    })
    @Length(1, 32768)
    @IsOptional()
    readonly encryptMessage?: string;

    @IsNotEmpty()
    @IsInteger()
    @ApiProperty({ description: 'Chat id' })
    readonly chatId!: number;

    @IsString()
    @ApiPropertyOptional({
        description: 'Message',

        minLength: 1,
        maxLength: 1024,
    })
    @Length(1, 1024)
    @IsOptional()
    readonly message?: string;

    @IsInteger()
    @ApiPropertyOptional({ description: 'Message' })
    @IsOptional()
    readonly parentMessageId?: number;
}
