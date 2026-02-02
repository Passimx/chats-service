import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../entities/user.entity';

export class GetMeDto {
    @ApiProperty()
    readonly id!: string;

    @ApiProperty()
    readonly name!: string;

    @ApiProperty()
    readonly userName!: string;

    @ApiProperty()
    readonly encryptedRsaPrivateKey!: string;

    @ApiProperty()
    readonly rsaPublicKey!: string;

    @ApiProperty()
    readonly seedPhraseHash!: string;

    constructor(payload: UserEntity) {
        this.id = payload.id;
        this.name = payload.name;
        this.userName = payload.userName;
        this.rsaPublicKey = payload.rsaPublicKey;
        this.encryptedRsaPrivateKey = payload.encryptedRsaPrivateKey;
        this.seedPhraseHash = payload.seedPhraseHash;
    }

    public static getFromEntity(entity: UserEntity): GetMeDto {
        return new GetMeDto(entity);
    }
}
