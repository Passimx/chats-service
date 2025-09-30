import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { FileEnum } from '../../types/file.enum';

export class CreateFileDto {
    @ApiProperty({ enum: FileEnum })
    @IsEnum(FileEnum)
    readonly fileType!: FileEnum;

    @ApiProperty()
    @IsNumber()
    readonly size!: number;

    @ApiProperty()
    @IsString()
    readonly mimeType!: string;

    @ApiProperty()
    @IsString()
    readonly url!: string;

    @ApiProperty()
    @IsString()
    readonly originalName!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    readonly duration?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? (JSON.parse(value) as number[]) : (value as number[])))
    @IsArray()
    @IsNumber({}, { each: true })
    readonly loudnessData?: number[];
}
