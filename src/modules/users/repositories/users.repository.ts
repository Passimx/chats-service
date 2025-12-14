import { SqlEntityRepository } from '@mikro-orm/postgresql';
import { UserEntity } from '../entities/user.entity';

export class UsersRepository extends SqlEntityRepository<UserEntity> {}
