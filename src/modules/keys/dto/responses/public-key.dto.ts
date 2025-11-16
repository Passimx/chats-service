import { ApiProperty } from '@nestjs/swagger';

export class PublicKeyDto {
    @ApiProperty()
    readonly publicKey!: string;
}
