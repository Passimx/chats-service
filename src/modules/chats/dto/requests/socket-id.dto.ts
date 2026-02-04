import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SocketIdDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly socketId!: string;
}
