import { ApiProperty } from '@nestjs/swagger';
import { Entity, Property } from '@mikro-orm/core';
import { CreatedEntity } from '../../../common/entities/created.entity';

@Entity({ tableName: 'messages' })
export class MessageEntity extends CreatedEntity {
    @ApiProperty()
    @Property({ length: 1000, nullable: true })
    readonly encryptMessage: string;

    @ApiProperty()
    @Property()
    readonly chatId!: number;

    @ApiProperty()
    @Property()
    number!: number;

    @ApiProperty()
    @Property({ nullable: true })
    message!: string; //используется только для openChat, в остальных частах используется encryptMessage

    constructor(encryptMessage: string, chatId: number, message: string, number: number) {
        super();
        this.encryptMessage = encryptMessage;
        this.message = message;
        this.chatId = chatId;
        this.number = number;
    }
}
