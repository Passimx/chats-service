import { ApiProperty } from '@nestjs/swagger';

export class UpdateReadChatType {
    @ApiProperty()
    readonly id!: string;

    @ApiProperty()
    readonly readMessage!: number;
}
