import { MikroOrmModule } from '@mikro-orm/nestjs';
import config from './mikro-orm.config';

export const getMikroOrmModule = () => MikroOrmModule.forRoot(config);
