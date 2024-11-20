import { Entity, Enum, OneToMany, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { MessageEntity } from './message.entity';

@Entity({ tableName: 'chats' })
export class ChatEntity extends CreatedEntity {
    @ApiProperty()
    @Property()
    readonly title: string;

    @ApiProperty()
    @Property({ default: 0 })
    readonly countMessages!: number;

    @ApiProperty()
    @Property({ nullable: true })
    readonly createdUserId!: number;

    @ApiProperty()
    @Enum({ default: ChatTypeEnum.IS_OPEN, items: () => ChatTypeEnum, nativeEnumName: 'chat_type_enum' })
    readonly type!: ChatTypeEnum;

    constructor(title: string) {
        super();

        this.title = title;
    }

    @OneToMany(() => MessageEntity, (message) => message.chat)
    readonly messages!: MessageEntity[];
}
