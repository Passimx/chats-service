import { Entity, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { CreatedUpdatedEntity } from '../../../common/entities/created-updated.entity';

@Entity({ tableName: 'chats' })
export class ChatEntity extends CreatedUpdatedEntity {
    @ApiProperty()
    @Property({ nullable: true })
    title!: string;
}
