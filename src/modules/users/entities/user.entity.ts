import { Entity } from '@mikro-orm/core';
import { CreatedUpdatedEntity } from '../../../common/entities/created-updated.entity';

@Entity({ tableName: 'users' })
export class UserEntity extends CreatedUpdatedEntity {}
