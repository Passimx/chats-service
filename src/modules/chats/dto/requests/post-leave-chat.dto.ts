import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LeaveChatsDto {
    @IsUUID('all', { each: true })
    @IsArray()
    @ApiProperty({
        description: 'Id chat',
        type: 'array',
        items: { type: 'string', format: 'uuid' },
    })
    readonly chatIds!: string[];
}
