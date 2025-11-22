import { Collection, Entity, Enum, Index, OneToMany, OneToOne, Property } from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { ChatsRepository } from '../repositories/chats.repository';
import { ChatKeyEntity } from '../../keys/entities/chat-key.entity';
import { MessageEntity } from './message.entity';

@Entity({ tableName: 'chats', repository: () => ChatsRepository })
@Index({ type: 'GIN', properties: 'title' })
@Index({ type: 'hash', properties: 'name' })
export class ChatEntity extends CreatedEntity {
    constructor(payload: Partial<ChatEntity>) {
        super();
        Object.assign(this, payload);
    }

    @ApiProperty({ nullable: true, maxLength: 64 })
    @Property({ length: 64, nullable: true })
    readonly name!: string;

    @ApiProperty()
    @Property({ nullable: true })
    readonly title?: string;

    @ApiProperty()
    @Property({ default: 0 })
    readonly countMessages!: number;

    @ApiProperty()
    @Enum({ default: ChatTypeEnum.IS_OPEN, items: () => ChatTypeEnum, nativeEnumName: 'chat_type_enum' })
    readonly type!: ChatTypeEnum;

    @ApiProperty()
    @Property({
        default: 1,
    })
    readonly maxUsersOnline!: number;

    @ApiPropertyOptional({ type: () => MessageEntity, isArray: true })
    @OneToOne(() => MessageEntity, (message) => message.chat, { unique: false })
    readonly message!: MessageEntity;

    @ApiProperty({ type: () => ChatKeyEntity, isArray: true, nullable: true })
    @OneToMany(() => ChatKeyEntity, (key) => key.chat)
    readonly keys = new Collection<ChatKeyEntity>(this);
}
