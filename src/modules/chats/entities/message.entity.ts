import { ApiProperty } from '@nestjs/swagger';
import { Entity, Property } from '@mikro-orm/core';
import { CreatedUpdatedEntity } from '../../../common/entities/created-updated.entity';

@Entity({ tableName: 'messages' })
export class MessageEntity extends CreatedUpdatedEntity {
    @ApiProperty()
    @Property({ length: 1000 })
    readonly encryptMessage!: string;

    @ApiProperty()
    @Property()
    chatId!: number;
}
