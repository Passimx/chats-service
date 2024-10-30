import { Entity, Enum, OneToOne, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { MessageEntity } from './message.entity';

@Entity({ tableName: 'chats' })
export class ChatEntity extends CreatedEntity {
    @ApiProperty()
    @Property()
    title!: string;

    @ApiProperty()
    @Property({ default: 0 })
    countMessages!: number;

    @ApiProperty()
    @Property({ nullable: true })
    createdUserId!: number;

    @ApiProperty()
    @Enum({ default: ChatTypeEnum.IS_OPEN, items: () => ChatTypeEnum, nativeEnumName: 'chat_type_enum' })
    readonly type!: ChatTypeEnum;

    @OneToOne(() => MessageEntity, (message) => message.chat)
    messages!: MessageEntity[];
}
