import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { PublicKeyMetadataType } from '../types/public-key-metadata.type';

@Entity({ tableName: 'public_keys' })
@Index({ properties: 'publicKeyHash', type: 'hash' })
export class PublicKeyEntity {
    @ApiProperty()
    @PrimaryKey({ length: 128 })
    readonly publicKeyHash!: string;

    @ApiProperty()
    @Property({ length: 128 })
    readonly name!: string;

    @ApiProperty()
    @Property({ length: 4096 })
    readonly publicKey!: string;

    @ApiProperty()
    @Property({ type: 'jsonb' })
    readonly metadata!: PublicKeyMetadataType;
}
