import { Controller, Get, Query, Headers } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesService } from '../services/files.service';
import { MessageDto } from '../../queue/dto/message.dto';
import { TranscriptionResponseDto } from '../dto/response/transcription-response.dto';
import { TopicsEnum } from '../../queue/types/topics.enum';
import { ApiData } from '../../../common/swagger/api-data.decorator';
import { QueryGetFilesDto } from '../dto/requests/query-get-files.dto';
import { DataResponse } from '../../../common/swagger/data-response.dto';

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

    @Get('media')
    @ApiOperation({ summary: 'Get files by media type with pagination' })
    @ApiData(Object, false)
    async getFilesMediaType(
        @Query() query: QueryGetFilesDto,
        @Headers('x-socket-id') userId: string,
    ): Promise<DataResponse<{ files: Array<{ fileId: string; chatId: string }>; nextOffset?: string }>> {
        const result = await this.filesService.getFilesByMediaType(userId, query);

        return new DataResponse(result);
    }
}
