import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { FileEnum } from '../../types/file.enum';

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
        type: String,
        description: 'file ID',
        required: false,
    })
    @IsOptional()
    @IsUUID('all')
    readonly fileIds?: string[];

    @ApiPropertyOptional({ enum: FileEnum })
    @IsOptional()
    @IsEnum(FileEnum)
    readonly fileType?: FileEnum;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    readonly size?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly mimetype?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly originalName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    readonly duration?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? (JSON.parse(value) as number[]) : (value as number[])))
    @IsArray()
    @IsNumber({}, { each: true })
    readonly loudnessData?: number[];
}
