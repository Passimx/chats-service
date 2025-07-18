import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Collection, Entity, Enum, Index, OneToMany, OneToOne, Property } from '@mikro-orm/core';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { MessageTypeEnum } from '../types/message-type.enum';
import { FileEntity } from '../../files/entity/file.entity';
import { ChatEntity } from './chat.entity';

@Entity({ tableName: 'messages' })
@Index({ properties: ['chatId', 'number'], type: 'btree' })
export class MessageEntity extends CreatedEntity {
    @ApiProperty()
    @Property({ length: 1000, nullable: true })
    readonly encryptMessage?: string;

    @ApiProperty()
    @Property({ persist: false })
    readonly chatId!: string;

    @ApiProperty()
    @Property()
    readonly number!: number;

    @Index()
    @ApiProperty()
    @Property({ length: 4096, nullable: true })
    readonly message?: string; //используется только для openChat, в остальных частах используется encryptMessage

    @ApiProperty()
    @Property({ persist: false })
    readonly parentMessageId?: string;

    @ApiProperty()
    @Enum({ items: () => MessageTypeEnum, nativeEnumName: 'message_type_enum', nullable: true })
    readonly type!: MessageTypeEnum;

    constructor(
        chatId: string,
        number: number,
        type: MessageTypeEnum,
        chat: ChatEntity,
        parentMessage: MessageEntity | null,
        encryptMessage?: string,
        message?: string,
    ) {
        super();
        this.chatId = chatId;
        this.number = number;
        this.chat = chat;

        if (encryptMessage) this.encryptMessage = encryptMessage;

        if (message) this.message = message;

        if (parentMessage) this.parentMessage = parentMessage;

        if (type) this.type = type;
    }

    @ApiPropertyOptional({ type: () => ChatEntity, isArray: false })
    @OneToOne(() => ChatEntity, { type: 'uuid', unique: false, hidden: true })
    readonly chat!: ChatEntity;

    @ApiPropertyOptional({ type: () => MessageEntity, isArray: false })
    @OneToOne(() => MessageEntity, { type: 'uuid', nullable: true, unique: false })
    readonly parentMessage!: MessageEntity;

    @ApiPropertyOptional({ type: () => FileEntity, isArray: true })
    @OneToMany(() => FileEntity, (files) => files.message)
    readonly files = new Collection<FileEntity>(this);
}
