import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Collection, Entity, Enum, Index, OneToMany, OneToOne, Property } from '@mikro-orm/core';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { MessageTypeEnum } from '../types/message-type.enum';
import { FileEntity } from './file.entity';
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
    @Enum({
        items: () => MessageTypeEnum,
        nativeEnumName: 'message_type_enum',
        nullable: true,
        default: MessageTypeEnum.IS_USER,
    })
    readonly type!: MessageTypeEnum;

    constructor(payload: Partial<MessageEntity>) {
        super();
        Object.assign(this, payload);
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
