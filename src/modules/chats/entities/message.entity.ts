import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Collection, Entity, Enum, Index, ManyToOne, OneToMany, OneToOne, Property } from '@mikro-orm/core';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { MessageTypeEnum } from '../types/message-type.enum';
import { MessagesRepository } from '../repositories/messages.repository';
import { UserEntity } from '../../users/entities/user.entity';
import { FileEntity } from './file.entity';
import { ChatEntity } from './chat.entity';

@Entity({ tableName: 'messages', repository: () => MessagesRepository })
@Index({ properties: ['chatId', 'number'], type: 'btree' })
export class MessageEntity extends CreatedEntity {
    constructor(payload: Partial<MessageEntity>) {
        super();
        Object.assign(this, payload);
    }

    @ApiProperty()
    @Property({ persist: false })
    readonly chatId!: string;

    @ApiProperty()
    @Property()
    readonly number!: number;

    @Index()
    @ApiProperty()
    @Property({ length: 4096, nullable: true })
    readonly message?: string;

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

    @ApiProperty()
    @Property({ persist: false, hidden: true })
    readonly userId!: string;

    @ApiPropertyOptional({ type: () => ChatEntity, isArray: false })
    @OneToOne(() => ChatEntity, { type: 'uuid', unique: false, hidden: true })
    readonly chat!: ChatEntity;

    @ApiPropertyOptional({ type: () => ChatEntity, nullable: true })
    @ManyToOne(() => UserEntity, { nullable: true })
    readonly user!: UserEntity;

    @ApiPropertyOptional({ type: () => MessageEntity, isArray: false })
    @ManyToOne(() => MessageEntity, { type: 'uuid', nullable: true })
    readonly parentMessage!: MessageEntity;

    @ApiPropertyOptional({ type: () => FileEntity, isArray: true })
    @OneToMany(() => FileEntity, (files) => files.message)
    readonly files = new Collection<FileEntity>(this);
}
