import { ApiProperty } from '@nestjs/swagger';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { EventsEnum } from '../types/events.enum';

export class MessageDto {
    @ApiProperty()
    readonly to: string;

    @ApiProperty({ enum: EventsEnum })
    readonly event: EventsEnum;

    @ApiProperty({ type: DataResponse<unknown> })
    readonly data: DataResponse<unknown>;

    constructor(to: string, event: EventsEnum, data: DataResponse<unknown>) {
        this.to = to;
        this.event = event;
        this.data = data;
    }
}
