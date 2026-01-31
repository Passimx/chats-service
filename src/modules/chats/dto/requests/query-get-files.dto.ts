import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
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

    @ApiPropertyOptional()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    readonly createdAt?: Date;
}
