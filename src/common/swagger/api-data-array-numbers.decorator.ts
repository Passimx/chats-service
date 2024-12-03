import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse } from '@nestjs/swagger';
import { ChatEntity } from '../../modules/chats/entities/chat.entity';
import { MessageEntity } from '../../modules/chats/entities/message.entity';

export function ApiDataArrayNumbers() {
    return applyDecorators(
        ApiExtraModels(ChatEntity, MessageEntity),
        ApiOkResponse({
            schema: {
                anyOf: [
                    {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            data: { type: 'array', items: { type: 'number' } },
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
