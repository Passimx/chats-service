import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TranscriptionResponseDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly fileId!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly transcription!: string;
}
