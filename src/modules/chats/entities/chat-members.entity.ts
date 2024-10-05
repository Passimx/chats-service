import { Entity, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { CreatedEntity } from '../../../common/entities/created.entity';

@Entity({ tableName: 'chat_members' })
export class ChatMembersEntity extends CreatedEntity {
    @ApiProperty()
    @Property()
    chatId!: number;

    @ApiProperty()
    @Property()
    userId!: number;

    @ApiProperty()
    @Property()
    lastNumberMessage!: number;
}
