import { Entity, Enum, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileEnum } from '../types/file.enum';
import { MessageEntity } from './message.entity';

@Entity({ tableName: 'files' })
@Index({ properties: ['id'], type: 'HASH' })
export class FileEntity {
    @ApiProperty()
    @PrimaryKey({ type: 'string' })
    readonly id!: string;

    @ApiProperty()
    @Property()
    readonly originalName!: string;

    @ApiProperty()
    @Property()
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
    @Property({ nullable: true })
    readonly duration?: number;

    @ApiProperty()
    @Property({ type: 'jsonb', nullable: true })
    readonly loudnessData?: number[];

    @ApiProperty()
    @Property({ defaultRaw: 'NOW()' })
    readonly createdAt!: Date;

    constructor(payload: Partial<FileEntity>) {
        Object.assign(this, payload);
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
