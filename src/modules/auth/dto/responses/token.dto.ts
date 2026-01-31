import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
    @ApiProperty()
    readonly token!: string;
}
