import { ApiProperty } from '@nestjs/swagger';

export class CreateOpenChatDto {
    @ApiProperty()
    title!: string;
}
