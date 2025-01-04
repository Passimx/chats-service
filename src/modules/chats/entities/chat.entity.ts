import { Entity, Enum, Index, OneToOne, Property } from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { MessageEntity } from './message.entity';

@Entity({ tableName: 'chats' })
@Index({ type: 'GIN', properties: 'title' })
export class ChatEntity extends CreatedEntity {
    constructor(title: string) {
        super();

        this.title = title;
    }

    @ApiProperty()
    @Property()
    readonly title: string;

    @ApiProperty()
    @Property({ default: 0 })
    countMessages!: number;

    @ApiProperty()
    @Property({ nullable: true })
    readonly createdUserId!: number;

    @ApiProperty()
    @Enum({ default: ChatTypeEnum.IS_OPEN, items: () => ChatTypeEnum, nativeEnumName: 'chat_type_enum' })
    readonly type!: ChatTypeEnum;

    @ApiPropertyOptional({ type: () => MessageEntity, isArray: true })
    @OneToOne(() => MessageEntity, (message) => message.chat)
    readonly message!: MessageEntity;
}
