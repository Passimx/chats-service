import { Entity, Index, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { CreatedEntity } from '../../../common/entities/created.entity';

@Entity({ tableName: 'files' })
@Index({ properties: ['id'], type: 'HASH' })
export class FilesEntity extends CreatedEntity {
    @ApiProperty()
    @Property()
    readonly originalName: string;

    @ApiProperty()
    @Property()
    readonly size?: number;

    @ApiProperty()
    @Property()
    readonly mimeType: string;

    constructor(originalName: string, mimeType: string, size?: number) {
        super();
        this.originalName = originalName;
        this.mimeType = mimeType;
        this.size = size;
    }
}
