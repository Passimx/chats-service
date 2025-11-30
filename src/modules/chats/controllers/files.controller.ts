import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { FilesService } from '../services/files.service';
import { MessageDto } from '../../queue/dto/message.dto';
import { TranscriptionResponseDto } from '../dto/response/transcription-response.dto';
import { TopicsEnum } from '../../queue/types/topics.enum';

@Controller('transcription')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @EventPattern(TopicsEnum.AUDIO_TRANSCRIPTION_RESPONSE)
    addTranscriptionVoice(@Payload() body: MessageDto) {
        if (!body.data.success) return;

        const response = body.data.data as TranscriptionResponseDto;

        return this.filesService.addTranscriptionVoice(response.fileId, response.transcription);
    }
}
