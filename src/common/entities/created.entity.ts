import { Property } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

export class CreatedEntity extends BaseEntity {
    @Property({ defaultRaw: 'NOW()' })
    createdAt!: Date;
}
