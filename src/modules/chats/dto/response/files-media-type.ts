import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { FileEntity } from '../../entities/file.entity';

export class FilesMediaTypeResponseDto {
    @ApiProperty({ type: [FileEntity], description: 'List of files (filtered by fileType when provided)' })
    @IsArray()
    readonly files!: FileEntity[];

    @ApiProperty({ description: 'Total count of files matching the filter' })
    @IsNumber()
    readonly count!: number;

    @ApiPropertyOptional({ description: 'Offset for next page, absent when no more pages' })
    @IsOptional()
    @IsNumber()
    readonly nextOffset?: number;
}
