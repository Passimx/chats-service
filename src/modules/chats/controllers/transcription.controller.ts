import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TranscriptionService } from '../services/transcription.service';
import { MessageDto } from '../../queue/dto/message.dto';
import { TranscriptionResponseDto } from '../dto/response/transcription-response.dto';
import { TopicsEnum } from '../../queue/types/topics.enum';

@Controller()
export class TranscriptionController {
    constructor(private readonly transcriptionService: TranscriptionService) {}

    @EventPattern(TopicsEnum.AUDIO_TRANSCRIPTION_RESPONSE)
    addTranscriptionVoice(@Payload() body: MessageDto) {
        const response = body.data.data as TranscriptionResponseDto;
        this.transcriptionService.addTranscriptionVoice(response.fileId, response.transcription);
    }
}
