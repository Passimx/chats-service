import { Property } from '@mikro-orm/core';
import { CreatedEntity } from './created.entity';

export class CreatedUpdatedEntity extends CreatedEntity {
    @Property({ onUpdate: () => new Date(), defaultRaw: 'NOW()' })
    updatedAt!: Date;
}
