import { ApiProperty } from '@nestjs/swagger';

export class DataResponse<T> {
    @ApiProperty()
    readonly success: boolean;
    @ApiProperty()
    readonly data: string | T;

    constructor(data: string | T) {
        if (typeof data === 'string') {
            this.success = false;
        }

        this.success = true;

        this.data = data;
    }
}
