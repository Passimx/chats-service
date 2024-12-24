import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Entity, Enum, Index, OneToOne, Property } from '@mikro-orm/core';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { MessageTypeEnum } from '../types/message-type.enum';
import { ChatEntity } from './chat.entity';

@Entity({ tableName: 'messages' })
export class MessageEntity extends CreatedEntity {
    @ApiProperty()
    @Property({ length: 1000, nullable: true })
    readonly encryptMessage?: string;

    @ApiProperty()
    @Property()
    readonly chatId!: number;

    @ApiProperty()
    @Property()
    number!: number;

    @Index()
    @ApiProperty()
    @Property({ nullable: true })
    message?: string; //используется только для openChat, в остальных частах используется encryptMessage

    @ApiProperty()
    @Property({ nullable: true })
    parentMessageId?: number;

    @ApiProperty()
    @Enum({ items: () => MessageTypeEnum, nativeEnumName: 'message_type_enum', nullable: true })
    readonly type!: MessageTypeEnum;

    constructor(
        chatId: number,
        number: number,
        type: MessageTypeEnum,
        encryptMessage?: string,
        message?: string,
        parentMessageId?: number,
    ) {
        super();
        this.chatId = chatId;
        this.number = number;

        if (encryptMessage) this.encryptMessage = encryptMessage;

        if (message) this.message = message;

        if (parentMessageId) this.parentMessageId = parentMessageId;

        if (type) this.type = type;
    }

    @ApiPropertyOptional({ type: () => ChatEntity, isArray: false })
    @OneToOne(() => ChatEntity, { persist: false })
    chat!: ChatEntity;

    @ApiPropertyOptional({ type: () => MessageEntity, isArray: false })
    @OneToOne(() => MessageEntity, { persist: false })
    parentMessage!: MessageEntity;
}
