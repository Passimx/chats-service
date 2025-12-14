import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../entities/user.entity';

export class GetUserDto {
    @ApiProperty()
    readonly name!: string;

    @ApiProperty()
    readonly userName!: string;

    @ApiProperty()
    readonly rsaPublicKey!: string;

    @ApiProperty()
    readonly createdAt!: Date;

    constructor(name: string, userName: string, rsaPublicKey: string, createdAt: Date) {
        this.name = name;
        this.userName = userName;
        this.rsaPublicKey = rsaPublicKey;
        this.createdAt = createdAt;
    }

    public static getFromEntity(entity: UserEntity): GetUserDto {
        return new GetUserDto(entity.name, entity.userName, entity.rsaPublicKey, entity.createdAt);
    }
}
