import { Entity, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { CreatedEntity } from '../../../common/entities/created.entity';

@Entity({ tableName: 'users' })
export class Users extends CreatedEntity {
    @ApiProperty()
    @Property()
    passwordHash!: string;
}
