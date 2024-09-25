import { PrimaryKey } from '@mikro-orm/core';

export class BaseEntity {
    @PrimaryKey()
    id!: number;
}
