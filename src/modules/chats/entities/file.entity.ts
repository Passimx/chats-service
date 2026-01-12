import { Entity, Enum, Index, ManyToOne, Property } from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileEnum } from '../types/file.enum';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { Metadata } from '../dto/requests/create-file.dto';
import { FilesRepository } from '../repositories/files.repository';
import { MessageEntity } from './message.entity';
import { ChatEntity } from './chat.entity';

@Entity({ tableName: 'files', repository: () => FilesRepository })
@Index({ properties: ['id'], type: 'HASH' })
export class FileEntity extends CreatedEntity {
    constructor(payload: Partial<FileEntity>) {
        super();
        Object.assign(this, payload);
    }

    @ApiProperty()
    @Property()
    readonly key!: string;

    @ApiProperty()
    @Property()
    readonly originalName!: string;

    @ApiProperty()
    @Property({ persist: false })
    readonly chatId!: string;

    @ApiProperty()
    @Property()
    readonly size!: number;

    @ApiProperty()
    @Property()
    readonly mimeType!: string;

    @ApiProperty()
    @Enum({ items: () => FileEnum, nativeEnumName: 'file_type_enum' })
    readonly fileType!: FileEnum;

    @ApiProperty()
    @Property({ persist: false })
    readonly messageId!: string;

    @ApiProperty()
    @Property({ type: 'jsonb', nullable: true })
    readonly metadata!: Metadata;

    @ApiProperty()
    @Property()
    readonly number!: number;

    @ApiPropertyOptional({ type: () => FileEntity })
    @ManyToOne(() => MessageEntity, {
        nullable: true,
        hidden: true,
        joinColumn: 'message_id',
        referenceColumnName: 'id',
    })
    readonly message?: MessageEntity;

    @ApiPropertyOptional({ type: () => ChatEntity })
    @ManyToOne(() => ChatEntity, {
        nullable: true,
        hidden: true,
        joinColumn: 'chat_id',
        referenceColumnName: 'id',
    })
    readonly chat?: ChatEntity;
}
