import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LeaveChatsDto {
    @IsUUID('all', { each: true })
    @IsArray()
    @ApiProperty({ description: 'Id chat' })
    readonly chatIds!: string[];
}
