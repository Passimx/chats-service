import { ApiProperty } from '@nestjs/swagger';

export class DataResponse<T> {
    @ApiProperty()
    readonly success: boolean;

    @ApiProperty()
    readonly data: string | T;

    constructor(data: string | T) {
        this.success = typeof data !== 'string';

        this.data = data;
    }
}
