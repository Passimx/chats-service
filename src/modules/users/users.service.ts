import { Injectable } from '@nestjs/common';
import { CryptoUtils } from '../../common/utils/crypto.utils';
import { DataResponse } from '../../common/swagger/data-response.dto';
import { MessageErrorEnum } from '../chats/types/message-error.enum';
import { ChatEntity } from '../chats/entities/chat.entity';
import { ChatTitleEnum } from '../chats/types/chat-title.enum';
import { ChatTypeEnum } from '../chats/types/chat-type.enum';
import { ChatKeyEntity } from '../chats/entities/chat-key.entity';
import { ChatsRepository } from '../chats/repositories/chats.repository';
import { ChatKeysRepository } from '../chats/repositories/chat-keys.repository';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { MeDto } from './dto/requests/me.dto';
import { GetMeDto } from './dto/responses/get-me.dto';
import { UpdateDto } from './dto/requests/update.dto';
import { GetUserDto } from './dto/responses/get-user.dto';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly chatsRepository: ChatsRepository,
        private readonly chatKeysRepository: ChatKeysRepository,
    ) {}

    public async getUserByUserName(userName: string): Promise<DataResponse<GetUserDto | string>> {
        const user = await this.usersRepository.findOne({ userName });

        if (!user) return new DataResponse(MessageErrorEnum.USER_NOT_FOUND);

        return new DataResponse<GetUserDto>(GetUserDto.getFromEntity(user));
    }

    public async getUserById(id: string): Promise<DataResponse<UserEntity | string>> {
        const user = await this.usersRepository.findOne({ id });

        if (!user) return new DataResponse(MessageErrorEnum.USER_NOT_FOUND);

        return new DataResponse<UserEntity>(user);
    }

    public async createUser(body: Partial<UserEntity>): Promise<DataResponse<UserEntity | string>> {
        const id = CryptoUtils.getHash(body.rsaPublicKey!);
        const userName = id;
        const user = await this.usersRepository.findOne({ id });

        if (user) return new DataResponse(MessageErrorEnum.USER_ALREADY_EXISTS);

        await this.usersRepository.insert({ id, userName, ...body } as UserEntity);

        const chatEntity = new ChatEntity({
            name: userName,
            title: ChatTitleEnum.FAVORITES,
            type: ChatTypeEnum.IS_FAVORITES,
        });

        await this.chatsRepository.insert(chatEntity);

        await this.chatKeysRepository.insert({
            chatId: chatEntity.id,
            userId: id,
        } as ChatKeyEntity);

        return this.getUserById(id);
    }

    public async getMe(body: MeDto): Promise<DataResponse<GetMeDto | string>> {
        const user = await this.usersRepository.findOne({ ...body });

        if (!user) return new DataResponse(MessageErrorEnum.USER_NOT_FOUND);

        return new DataResponse(new GetMeDto(user.encryptedRsaPrivateKey));
    }

    public async updateUser(body: UpdateDto): Promise<DataResponse<string | object>> {
        const user = await this.usersRepository.findOne({ id: body.id, seedPhraseHash: body.seedPhraseHash });

        if (!user) return new DataResponse(MessageErrorEnum.USER_NOT_FOUND);

        await this.usersRepository.nativeUpdate({ id: body.id }, { name: body.name });

        return new DataResponse({});
    }
}
