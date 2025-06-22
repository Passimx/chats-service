import { Entity, Index, ManyToOne, Property } from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { MessageEntity } from '../../chats/entities/message.entity';

@Entity({ tableName: 'files' })
@Index({ properties: ['id'], type: 'HASH' })
export class FileEntity extends CreatedEntity {
    @ApiProperty()
    @Property()
    readonly originalName: string;

    @ApiProperty()
    @Property()
    readonly size?: number;

    @ApiProperty()
    @Property()
    readonly mimeType: string;

    @ApiProperty()
    @Property({ persist: false })
    readonly messageId?: string;

    constructor(originalName: string, mimeType: string, size?: number) {
        super();
        this.originalName = originalName;
        this.mimeType = mimeType;
        this.size = size;
    }

    @ApiPropertyOptional({ type: () => FileEntity, isArray: true })
    @ManyToOne(() => MessageEntity, {
        nullable: true,
        joinColumn: 'message_id',
        referenceColumnName: 'id',
    })
    readonly message?: MessageEntity;
}
