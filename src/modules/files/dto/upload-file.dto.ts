import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FileEnum } from '../types/file.enum';

export class UploadFileDto {
    @ApiProperty({ enum: FileEnum })
    @IsEnum(FileEnum)
    readonly fileType!: FileEnum;
}
