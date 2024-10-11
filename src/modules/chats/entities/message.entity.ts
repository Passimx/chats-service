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

    constructor(encryptMessage: string, id: number, message: string) {
        super();
        this.encryptMessage = encryptMessage;
        this.message = message;
        this.chatId = id;
        this.number = 1;
    }
}
