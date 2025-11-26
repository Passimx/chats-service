import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { DataResponse } from '../../common/swagger/data-response.dto';
import { MessageErrorEnum } from '../chats/types/message-error.enum';
import { CryptoUtils } from '../../common/utils/crypto.utils';
import { ChatsRepository } from '../chats/repositories/chats.repository';
import { ChatEntity } from '../chats/entities/chat.entity';
import { ChatTypeEnum } from '../chats/types/chat-type.enum';
import { ChatTitleEnum } from '../chats/types/chat-title.enum';
import { ChatKeyEntity } from './entities/chat-key.entity';
import { PublicKeyEntity } from './entities/public-key.entity';
import { PublicKeyDto } from './dto/responses/public-key.dto';
import { KeepPublicKeyDto } from './dto/requests/keep-public-key.dto';
import { UpdatePublicKey } from './dto/requests/update-public-key';

@Injectable()
export class KeysService {
    constructor(
        @InjectRepository(PublicKeyEntity)
        private readonly publicKeysRepository: EntityRepository<PublicKeyEntity>,
        @InjectRepository(ChatKeyEntity)
        private readonly chatKeysRepository: EntityRepository<ChatKeyEntity>,
        private readonly chatsRepository: ChatsRepository,
    ) {}

    public async getPublicKey(publicKeyHash: string): Promise<DataResponse<PublicKeyDto | string>> {
        const publicKeyEntity = await this.publicKeysRepository.findOne({ publicKeyHash });

        if (!publicKeyEntity) return new DataResponse<string>(MessageErrorEnum.PUBLIC_KEY_NOT_FOUND);

        return new DataResponse<PublicKeyDto>({ publicKey: publicKeyEntity.publicKey, name: publicKeyEntity.name });
    }

    public async keepPubicKey(data: KeepPublicKeyDto): Promise<DataResponse<PublicKeyDto | string>> {
        const publicKeyHash = CryptoUtils.getHash(data.publicKey);
        await this.publicKeysRepository.insert({
            publicKeyHash,
            name: publicKeyHash,
            publicKey: data.publicKey,
            metadata: data.metadata,
        });

        const chatEntity = new ChatEntity({
            name: publicKeyHash,
            title: ChatTitleEnum.FAVORITES,
            type: ChatTypeEnum.IS_FAVORITES,
        });

        await this.chatsRepository.insert(chatEntity);

        await this.chatKeysRepository.insert({
            chatId: chatEntity.id,
            publicKeyHash,
            received: true,
        } as ChatKeyEntity);

        return this.getPublicKey(publicKeyHash);
    }

    public async updatePubicKey(publicKeyHash: string, data: UpdatePublicKey): Promise<void> {
        await this.publicKeysRepository.nativeUpdate({ publicKeyHash }, data);
    }

    public async receiveKey(chatId: string, publicKeyHash: string): Promise<void> {
        await this.chatKeysRepository.nativeUpdate({ chatId, publicKeyHash }, { received: true });
    }
}
