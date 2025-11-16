import { SqlEntityRepository } from '@mikro-orm/postgresql';
import { ChatKeyEntity } from '../../keys/entities/chat-key.entity';

export class ChatKeysRepository extends SqlEntityRepository<ChatKeyEntity> {}
