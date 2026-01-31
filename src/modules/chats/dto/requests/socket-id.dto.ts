import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SocketIdDto {
    @ApiProperty()
    @IsUUID()
    readonly socketId!: string;
}
