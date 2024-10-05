import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Users } from './entities/user.entity';

@Module({
    imports: [MikroOrmModule.forFeature([Users])],
})
export class UsersModule {}
