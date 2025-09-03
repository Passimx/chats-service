import { Entity, Enum, Index, ManyToOne, Property } from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { MessageEntity } from '../../chats/entities/message.entity';
import { FileEnum } from '../types/file.enum';

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
    @Enum({ items: () => FileEnum, nativeEnumName: 'file_type_enum' })
    readonly fileType: FileEnum;

    @ApiProperty()
    @Property({ persist: false })
    readonly messageId?: string;

    @ApiProperty()
    @Property({ nullable: true })
    duration?: number;

    @ApiProperty()
    @Property({ type: 'jsonb', nullable: true })
    loudnessData?: number[];

    constructor(originalName: string, mimeType: string, fileType: FileEnum, size?: number) {
        super();
        this.originalName = originalName;
        this.mimeType = mimeType;
        this.fileType = fileType;
        this.size = size;
    }

    @ApiPropertyOptional({ type: () => FileEntity, isArray: true })
    @ManyToOne(() => MessageEntity, {
        nullable: true,
        hidden: true,
        joinColumn: 'message_id',
        referenceColumnName: 'id',
    })
    readonly message?: MessageEntity;
}
