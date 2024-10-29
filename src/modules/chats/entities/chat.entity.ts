import { Entity, OneToOne, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { CreatedEntity } from '../../../common/entities/created.entity';
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

    @OneToOne(() => MessageEntity, (message) => message.chat)
    messages!: MessageEntity[];
}
