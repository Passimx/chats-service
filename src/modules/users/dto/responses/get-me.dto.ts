import { ApiProperty } from '@nestjs/swagger';

export class GetMeDto {
    @ApiProperty()
    readonly encryptedRsaPrivateKey!: string;

    constructor(encryptedRsaPrivateKey: string) {
        this.encryptedRsaPrivateKey = encryptedRsaPrivateKey;
    }
}
