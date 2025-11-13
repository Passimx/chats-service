import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { DataResponse } from '../../common/swagger/data-response.dto';
import { MessageErrorEnum } from '../chats/types/message-error.enum';
import { CryptoUtils } from '../../common/utils/crypto.utils';
import { PublicKeyEntity } from './entities/public-key.entity';
import { PublicKeyDto } from './dto/responses/public-key.dto';
import { KeepPublicKeyDto } from './dto/requests/keep-public-key.dto';

@Injectable()
export class KeysService {
    constructor(
        @InjectRepository(PublicKeyEntity)
        private readonly keysRepository: EntityRepository<PublicKeyEntity>,
    ) {}

    public async getPublicKey(publicKeyHash: string): Promise<DataResponse<PublicKeyDto | string>> {
        const publicKeyEntity = await this.keysRepository.findOne({ publicKeyHash });

        if (!publicKeyEntity) return new DataResponse<string>(MessageErrorEnum.PUBLIC_KEY_NOT_FOUND);

        return new DataResponse<PublicKeyDto>({ publicKey: publicKeyEntity.publicKey });
    }

    public async keepPubicKey({ publicKey }: KeepPublicKeyDto): Promise<DataResponse<PublicKeyDto | string>> {
        const publicKeyHash = CryptoUtils.getHash(publicKey);

        await this.keysRepository.insert({ publicKeyHash, publicKey });

        return new DataResponse<PublicKeyDto>({ publicKey });
    }
}
