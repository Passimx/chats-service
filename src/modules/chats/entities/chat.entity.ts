import { Entity, Enum, Index, OneToOne, Property } from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { ChatsRepository } from '../repositories/chats.repository';
import { MessageEntity } from './message.entity';

@Entity({ tableName: 'chats', repository: () => ChatsRepository })
@Index({ type: 'GIN', properties: 'title' })
export class ChatEntity extends CreatedEntity {
    @ApiProperty()
    @Property()
    readonly title!: string;

    @ApiProperty()
    @Property({ default: 0 })
    readonly countMessages!: number;

    @ApiProperty()
    @Enum({ default: ChatTypeEnum.IS_OPEN, items: () => ChatTypeEnum, nativeEnumName: 'chat_type_enum' })
    readonly type!: ChatTypeEnum;

    constructor(payload: Partial<ChatEntity>) {
        super();
        Object.assign(this, payload);
    }

    @ApiProperty()
    @Property({
        default: 1,
    })
    readonly maxUsersOnline!: number;

    @ApiPropertyOptional({ type: () => MessageEntity, isArray: true })
    @OneToOne(() => MessageEntity, (message) => message.chat, { unique: false })
    readonly message!: MessageEntity;
}
