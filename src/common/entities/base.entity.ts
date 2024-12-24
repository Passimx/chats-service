import { PrimaryKey } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';

export class BaseEntity {
    @ApiProperty()
    @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
    readonly id!: string;
}
