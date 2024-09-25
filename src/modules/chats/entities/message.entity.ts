import { ApiProperty } from '@nestjs/swagger';
import { Entity } from '@mikro-orm/core';
import { CreatedUpdatedEntity } from '../../../common/entities/created-updated.entity';

@Entity({ tableName: 'messages' })
export class MessageEntity extends CreatedUpdatedEntity {
    @ApiProperty()
    readonly encryptMessage!: string;
}
