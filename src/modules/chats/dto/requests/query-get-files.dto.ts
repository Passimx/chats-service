import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { FileEnum } from '../../types/file.enum';

export class QueryGetFilesDto {
    @ApiProperty()
    @IsString()
    readonly chatId!: string;

    @ApiProperty({ enum: FileEnum })
    @IsEnum(FileEnum)
    readonly mediaType!: FileEnum;

    @ApiProperty()
    @IsNumber()
    readonly limit!: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    readonly offset?: string;
}