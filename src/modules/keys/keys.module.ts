import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PublicKeyEntity } from './entities/public-key.entity';
import { KeysService } from './keys.service';
import { KeysController } from './keys.controller';

@Module({
    imports: [MikroOrmModule.forFeature([PublicKeyEntity])],
    controllers: [KeysController],
    providers: [KeysService],
})
export class KeysModule {}
