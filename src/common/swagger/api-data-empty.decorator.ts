import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

export const ApiDataEmpty = () =>
    applyDecorators(
        ApiOkResponse({
            schema: {
                anyOf: [
                    {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            data: { type: 'object' },
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
