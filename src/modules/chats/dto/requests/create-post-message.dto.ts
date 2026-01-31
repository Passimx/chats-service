import { IsArray, IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID, Length, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateFileDto } from './create-file.dto';

export class CreateMessageDto {
    @IsNotEmpty()
    @IsUUID('all')
    @ApiProperty({ description: 'Chat id' })
    readonly chatId!: string;

    @IsString()
    @ApiPropertyOptional({
        description: 'Message',
        minLength: 1,
        maxLength: 2 ** 12,
    })
    @Length(1, 2 ** 12)
    @IsOptional()
    readonly message?: string;

    @ApiPropertyOptional({ description: 'Message id' })
    @IsOptional()
    @IsUUID('all')
    readonly parentMessageId?: string;

    @ApiPropertyOptional({ type: CreateFileDto, isArray: true })
    @IsArray()
    @IsOptional()
    @Type(() => CreateFileDto)
    @ValidateNested({ each: true })
    @IsDefined()
    readonly files?: CreateFileDto[];
}
