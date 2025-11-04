import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { EventsEnum } from '../types/events.enum';

export class MessageDto {
    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    readonly to?: string;

    @ApiProperty({ enum: EventsEnum })
    @IsEnum(EventsEnum)
    readonly event: EventsEnum;

    @ApiProperty({ type: DataResponse<unknown> })
    readonly data: DataResponse<unknown>;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    readonly publicKey?: string;

    constructor(to: string | undefined, event: EventsEnum, data: DataResponse<unknown>, publicKey?: string) {
        this.to = to;
        this.event = event;
        this.data = data;
        this.publicKey = publicKey;
    }
}
