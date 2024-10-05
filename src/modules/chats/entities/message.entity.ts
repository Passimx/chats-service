import { ApiProperty } from '@nestjs/swagger';
import { Entity, Property } from '@mikro-orm/core';
import { CreatedEntity } from '../../../common/entities/created.entity';

@Entity({ tableName: 'messages' })
export class MessageEntity extends CreatedEntity {
    @ApiProperty()
    @Property({ length: 1000 })
    readonly encryptMessage: string;

    @ApiProperty()
    @Property()
    readonly chatId!: number;

    @ApiProperty()
    @Property()
    number!: number;

    @ApiProperty()
    @Property()
    message!: string; //используется только для openChat, в остальных частах используется encryptMessage

    constructor(message: string, id: number) {
        super();
        this.encryptMessage = message;
        this.chatId = id;
    }
}
