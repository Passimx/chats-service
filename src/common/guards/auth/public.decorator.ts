import { applyDecorators, SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_METADATA_KEY } from './cerification-type.metadata-key';

export const Public = () => applyDecorators(SetMetadata(IS_PUBLIC_METADATA_KEY, true));
