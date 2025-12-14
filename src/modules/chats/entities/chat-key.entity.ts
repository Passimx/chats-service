import { Entity, Index, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { ChatKeysRepository } from '../repositories/chat-keys.repository';
import { UserEntity } from '../../users/entities/user.entity';
import { ChatEntity } from './chat.entity';

@Entity({ tableName: 'chat_keys', repository: () => ChatKeysRepository })
@Unique({ properties: ['chatId', 'userId'] })
@Index({ properties: ['userId', 'chatId'], type: 'btree' })
export class ChatKeyEntity extends CreatedEntity {
    constructor(payload: Partial<ChatKeyEntity>) {
        super();
        Object.assign(this, payload);
    }

    @ApiProperty()
    @Property({ persist: false, lazy: true })
    readonly chatId!: string;

    @ApiProperty()
    @Property({ persist: false, lazy: true })
    readonly userId!: string;

    @ApiProperty({ nullable: true })
    @Property({ length: 4096, nullable: true })
    readonly encryptionKey!: string;

    @ApiProperty()
    @Property({ default: false })
    readonly received!: boolean;

    @ApiProperty({ type: () => ChatEntity })
    @ManyToOne(() => ChatEntity, { lazy: true })
    readonly chat!: ChatEntity;

    @ApiProperty({ type: () => UserEntity })
    @ManyToOne(() => UserEntity, { joinColumn: 'user_id', referencedColumnNames: ['id'], length: 2 ** 6 })
    readonly user!: UserEntity;
}
