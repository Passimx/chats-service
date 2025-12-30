import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { FileEnum } from '../../types/file.enum';

export class QueryGetFilesDto {
    @ApiProperty()
    @IsString()
    readonly chatId!: string;

    @ApiPropertyOptional({ enum: FileEnum })
    @IsOptional()
    @IsEnum(FileEnum)
    readonly mediaType?: FileEnum;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    readonly limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    readonly offset?: number;
}
