import { SqlEntityRepository } from '@mikro-orm/postgresql';
import { SessionEntity } from '../entities/session.entity';

export class SessionsRepository extends SqlEntityRepository<SessionEntity> {}
