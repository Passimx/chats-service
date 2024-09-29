import { Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { CreatedEntity } from './created.entity';

export class CreatedUpdatedEntity extends CreatedEntity {
    @ApiProperty()
    @Property({ onUpdate: () => new Date(), defaultRaw: 'NOW()' })
    updatedAt!: Date;
}
