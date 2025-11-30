import { SqlEntityRepository } from '@mikro-orm/postgresql';
import { MessageEntity } from '../entities/message.entity';

export class MessagesRepository extends SqlEntityRepository<MessageEntity> {}
