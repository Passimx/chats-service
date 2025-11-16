import { Entity, Index, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { ChatKeysRepository } from '../../chats/repositories/chat-keys.repository';
import { ChatEntity } from '../../chats/entities/chat.entity';

@Entity({ tableName: 'chat_keys', repository: () => ChatKeysRepository })
@Unique({ properties: ['chatId', 'publicKeyHash'] })
@Index({ properties: ['publicKeyHash', 'chatId'], type: 'btree' })
export class ChatKeyEntity extends CreatedEntity {
    constructor(payload: Partial<ChatKeyEntity>) {
        super();
        Object.assign(this, payload);
    }

    @ApiProperty()
    @Property({ persist: false })
    readonly chatId!: string;

    @ApiProperty()
    @Property({ length: 128 })
    readonly publicKeyHash!: string;

    @ApiProperty()
    @Property({ length: 4096 })
    readonly encryptionKey!: string;

    @ApiProperty()
    @Property({ default: false })
    readonly received!: boolean;

    @ApiProperty({ type: () => ChatEntity })
    @ManyToOne(() => ChatEntity)
    readonly chat!: ChatEntity;
}
