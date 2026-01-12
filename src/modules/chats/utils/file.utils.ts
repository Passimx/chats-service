import { FileEnum } from '../types/file.enum';

export function getMediaTypeFromMimeType(mimeType: string): FileEnum {
    if (mimeType.startsWith('image/')) {
        return FileEnum.IS_PHOTO;
    }

    if (mimeType.startsWith('video/')) {
        return FileEnum.IS_VIDEO;
    }

    if (mimeType.startsWith('audio/')) {
        return FileEnum.IS_AUDIO;
    }

    return FileEnum.IS_MEDIA;
}

export function getMediaTypeString(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'photo';

    if (mimeType.startsWith('video/')) return 'video';

    if (mimeType.startsWith('audio/')) return 'audio';

    return 'other';
}

export function getMimePattern(mediaType: string): string {
    if (mediaType === 'photo') return 'image/%';

    if (mediaType === 'video') return 'video/%';

    if (mediaType === 'audio') return 'audio/%';

    return '%';
}
