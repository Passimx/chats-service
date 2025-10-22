import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDefined, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { FileEnum } from '../../types/file.enum';

class Metadata {
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

export class CreateFileDto {
    @ApiProperty()
    @IsString()
    readonly key!: string;

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
    readonly originalName!: string;

    @ApiPropertyOptional({ type: Metadata })
    @IsOptional()
    @Type(() => Metadata)
    @IsDefined()
    readonly metadata?: Metadata;
}
