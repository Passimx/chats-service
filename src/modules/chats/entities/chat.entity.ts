import { Entity, Property } from '@mikro-orm/core';
import { CreatedUpdatedEntity } from '../../../common/entities/created-updated.entity';

@Entity({ tableName: 'chats' })
export class ChatEntity extends CreatedUpdatedEntity {
    @Property({ nullable: true })
    readonly title!: string;
}
