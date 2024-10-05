import { PrimaryKey } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';

export class BaseEntity {
    @ApiProperty()
    @PrimaryKey()
    id!: number;
}
