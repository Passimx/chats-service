import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ChatEntity } from '../../modules/chats/entities/chat.entity';
import { MessageEntity } from '../../modules/chats/entities/message.entity';
import { FavoriteChat } from '../../modules/chats/dto/requests/post-favorites-chat.dto';

export function ApiData(type: Type, isArray = false) {
    const array = {
        type: 'array',
        items: { $ref: getSchemaPath(type) },
    };

    const notArray = { $ref: getSchemaPath(type) };

    return applyDecorators(
        ApiExtraModels(ChatEntity, MessageEntity, FavoriteChat),
        ApiOkResponse({
            schema: {
                anyOf: [
                    {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            data: isArray ? array : notArray,
                        },
                        required: ['success', 'data'],
                    },

                    {
                        type: 'object',

                        properties: {
                            success: { type: 'boolean', example: false },
                            data: {
                                type: 'string',
                            },
                        },
                        required: ['success', 'data'],
                    },
                ],
            },
        }),
    );
}
