import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesService } from '../services/files.service';
import { MessageDto } from '../../queue/dto/message.dto';
import { TranscriptionResponseDto } from '../dto/response/transcription-response.dto';
import { TopicsEnum } from '../../queue/types/topics.enum';
import { ApiData } from '../../../common/swagger/api-data.decorator';
import { QueryGetFilesDto } from '../dto/requests/query-get-files.dto';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { FileEntity } from '../entities/file.entity';

@ApiTags('Files')
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @EventPattern(TopicsEnum.AUDIO_TRANSCRIPTION_RESPONSE)
    addTranscriptionVoice(@Payload() body: MessageDto) {
        if (!body.data.success) return;

        const response = body.data.data as TranscriptionResponseDto;

        return this.filesService.addTranscriptionVoice(response.fileId, response.transcription);
    }

    @Get()
    @ApiOperation({ summary: 'Get files by media type (or all files) with pagination' })
    @ApiData(FileEntity, true)
    async getFilesMediaType(@Query() query: QueryGetFilesDto): Promise<
        DataResponse<{
            files: FileEntity[];
            nextOffset?: number;
        }>
    > {
        const result = await this.filesService.getFilesByMediaType(query);

        return new DataResponse(result);
    }

    @Get('next-file')
    @ApiOperation({ summary: 'Get next file by media type' })
    @ApiData(FileEntity, false)
    async getNextFilesByMediaType(@Query() query: QueryGetFilesDto): Promise<DataResponse<FileEntity | null>> {
        const result = await this.filesService.getNextFilesByMediaType(query);

        return new DataResponse(result);
    }

    @Get('prev-file')
    @ApiOperation({ summary: 'Get previous file by media type' })
    @ApiData(FileEntity, false)
    async getPrevByMediaType(@Query() query: QueryGetFilesDto): Promise<DataResponse<FileEntity | null>> {
        const result = await this.filesService.getPrevFilesByMediaType(query);

        return new DataResponse(result);
    }

    @Get(':fileId')
    @ApiOperation({ summary: 'Get file by fileId with createdAt for navigation' })
    @ApiData(FileEntity, false)
    async getFileById(
        @Param('fileId') fileId: string,
        @Query('chatId') chatId: string,
    ): Promise<DataResponse<FileEntity>> {
        const result = await this.filesService.getFileById(fileId, chatId);

        return new DataResponse(result);
    }
}
