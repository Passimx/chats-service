import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { DataResponse } from '../../common/swagger/data-response.dto';
import { MessageErrorEnum } from '../chats/types/message-error.enum';
import { CryptoUtils } from '../../common/utils/crypto.utils';
import { ChatKeyEntity } from './entities/chat-key.entity';
import { PublicKeyEntity } from './entities/public-key.entity';
import { PublicKeyDto } from './dto/responses/public-key.dto';
import { KeepPublicKeyDto } from './dto/requests/keep-public-key.dto';

@Injectable()
export class KeysService {
    constructor(
        @InjectRepository(PublicKeyEntity)
        private readonly publicKeysRepository: EntityRepository<PublicKeyEntity>,
        @InjectRepository(ChatKeyEntity)
        private readonly chatKeysRepository: EntityRepository<ChatKeyEntity>,
    ) {}

    public async getPublicKey(publicKeyHash: string): Promise<DataResponse<PublicKeyDto | string>> {
        const publicKeyEntity = await this.publicKeysRepository.findOne({ publicKeyHash });

        if (!publicKeyEntity) return new DataResponse<string>(MessageErrorEnum.PUBLIC_KEY_NOT_FOUND);

        return new DataResponse<PublicKeyDto>({
            publicKey: publicKeyEntity.publicKey,
            publicKeyHash: publicKeyEntity.publicKeyHash,
        });
    }

    public async keepPubicKey({ publicKey }: KeepPublicKeyDto): Promise<DataResponse<PublicKeyDto | string>> {
        const publicKeyHash = CryptoUtils.getHash(publicKey);

        await this.publicKeysRepository.insert({ publicKeyHash, publicKey });

        return new DataResponse<PublicKeyDto>({ publicKey, publicKeyHash });
    }

    public async receiveKey(chatId: string, publicKeyHash: string): Promise<void> {
        await this.chatKeysRepository.nativeUpdate({ chatId, publicKeyHash }, { received: true });

        const countNotReceivedKeys = await this.chatKeysRepository.count({ chatId, received: false });

        if (countNotReceivedKeys === 0) await this.chatKeysRepository.nativeDelete({ chatId });
    }
}
