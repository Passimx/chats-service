import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class DataResponse<T> {
    @IsBoolean()
    @ApiProperty()
    readonly success: boolean;

    @ApiProperty()
    readonly data: string | T;

    constructor(data: string | T) {
        this.success = typeof data !== 'string';

        this.data = data;
    }
}
