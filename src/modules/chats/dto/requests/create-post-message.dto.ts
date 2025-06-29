import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
    @IsUUID('all')
    @ApiProperty({ description: 'Chat id' })
    readonly chatId!: string;

    @IsString()
    @ApiPropertyOptional({
        description: 'Message',

        minLength: 1,
        maxLength: 4096,
    })
    @Length(1, 4096)
    @IsOptional()
    readonly message?: string;

    @ApiPropertyOptional({ description: 'Message id' })
    @IsOptional()
    @IsUUID('all')
    readonly parentMessageId?: string;

    @ApiPropertyOptional({
        type: [String],
        description: 'Array of file IDs',
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsUUID('all', { each: true })
    readonly fileIds?: string[];
}
