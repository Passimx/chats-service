import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DialoguesService } from '../services/dialogues.service';
import { ApiData } from '../../../common/swagger/api-data.decorator';
import { CreateDialoguesDto } from '../dto/requests/create-dialogues.dto';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { ChatEntity } from '../entities/chat.entity';

@ApiTags('Dialogues')
@Controller('dialogues')
export class DialoguesController {
    constructor(private readonly dialoguesService: DialoguesService) {}

    @Post()
    @ApiData(ChatEntity)
    createDialogue(
        @Body() body: CreateDialoguesDto,
        @Headers('x-socket-id') socketId: string,
    ): Promise<DataResponse<ChatEntity | string>> {
        return this.dialoguesService.createDialogue(socketId, body);
    }
}
