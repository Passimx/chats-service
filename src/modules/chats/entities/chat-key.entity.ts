import { Entity, Index, Property, Unique } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { CreatedEntity } from '../../../common/entities/created.entity';

@Entity({ tableName: 'chat_keys' })
@Unique({ properties: ['chatId', 'publicKey'] })
@Index({ properties: ['publicKey', 'chatId'], type: 'btree' })
export class ChatKeyEntity extends CreatedEntity {
    @ApiProperty()
    @Property({ type: 'uuid' })
    @IsString()
    readonly chatId!: string;

    @ApiProperty()
    @Property()
    @IsString()
    readonly publicKey!: string;

    @ApiProperty()
    @Property()
    @IsString()
    readonly encryptionKey!: string;

    @ApiProperty()
    @IsBoolean()
    @Property({ default: false })
    readonly received!: boolean;

    constructor(payload: Partial<ChatKeyEntity>) {
        super();
        Object.assign(this, payload);
    }
}
