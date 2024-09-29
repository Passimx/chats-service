import { Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from './base.entity';

export class CreatedEntity extends BaseEntity {
    @ApiProperty()
    @Property({ defaultRaw: 'NOW()' })
    createdAt!: Date;
}
