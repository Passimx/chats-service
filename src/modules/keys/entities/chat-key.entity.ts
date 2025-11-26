import { Entity, Index, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { ChatKeysRepository } from '../../chats/repositories/chat-keys.repository';
import { ChatEntity } from '../../chats/entities/chat.entity';
import { PublicKeyEntity } from './public-key.entity';

@Entity({ tableName: 'chat_keys', repository: () => ChatKeysRepository })
@Unique({ properties: ['chatId', 'publicKeyHash'] })
@Index({ properties: ['publicKeyHash', 'chatId'], type: 'btree' })
export class ChatKeyEntity extends CreatedEntity {
    constructor(payload: Partial<ChatKeyEntity>) {
        super();
        Object.assign(this, payload);
    }

    @ApiProperty()
    @Property({ persist: false, lazy: true })
    readonly chatId!: string;

    @ApiProperty()
    @Property({ persist: false, lazy: true })
    readonly publicKeyHash!: string;

    @ApiProperty({ nullable: true })
    @Property({ length: 4096, nullable: true })
    readonly encryptionKey!: string;

    @ApiProperty()
    @Property({ default: false })
    readonly received!: boolean;

    @ApiProperty({ type: () => ChatEntity })
    @ManyToOne(() => ChatEntity, { lazy: true })
    readonly chat!: ChatEntity;

    @ApiProperty({ type: () => PublicKeyEntity })
    @ManyToOne(() => PublicKeyEntity, {
        joinColumn: 'public_key_hash',
        referencedColumnNames: ['public_key_hash'],
        length: 128,
    })
    readonly publicKey!: PublicKeyEntity;
}
