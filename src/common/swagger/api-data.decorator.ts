import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export function ApiData(type: Type, isArray = false) {
    const array = {
        type: 'array',
        items: { $ref: getSchemaPath(type) },
    };

    const notArray = { $ref: getSchemaPath(type) };

    return applyDecorators(
        ApiExtraModels(type),
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
