import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { EventsEnum } from '../types/events.enum';

export class MessageDto {
    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    readonly to: string;

    @ApiProperty({ enum: EventsEnum })
    @IsEnum(EventsEnum)
    readonly event: EventsEnum;

    @ApiProperty({ type: DataResponse<unknown> })
    readonly data: DataResponse<unknown>;

    constructor(to: string, event: EventsEnum, data: DataResponse<unknown>) {
        this.to = to;
        this.event = event;
        this.data = data;
    }
}
