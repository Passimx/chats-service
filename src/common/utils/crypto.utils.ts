import { createHmac, subtle } from 'crypto';
import { Envs } from '../envs/env';

export class CryptoUtils {
    public static importRSAKey(
        key: JsonWebKey | string,
        keyUsages: ReadonlyArray<KeyUsage>,
    ): Promise<CryptoKey> | undefined {
        try {
            const jsonWebKey = typeof key === 'string' ? (JSON.parse(key) as JsonWebKey) : key;

            return subtle.importKey(
                'jwk',
                jsonWebKey,
                {
                    name: 'RSA-OAEP',
                    hash: 'SHA-512',
                },
                true,
                keyUsages,
            );
        } catch (error) {
            return undefined;
        }
    }

    public static exportEncryptedPayload(payload: ArrayBuffer): string | undefined {
        try {
            const uint8Array = new Uint8Array(payload);

            return JSON.stringify(uint8Array.toString());
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return undefined;
        }
    }

    public static async encryptByRSAKey(key: CryptoKey, payload: unknown): Promise<string | undefined> {
        try {
            const encryptedData = await subtle.encrypt(
                {
                    name: 'RSA-OAEP',
                },
                key,
                new TextEncoder().encode(JSON.stringify(payload)),
            );

            return this.exportEncryptedPayload(encryptedData);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return undefined;
        }
    }

    public static getHash(value: string): string {
        return createHmac('sha256', Envs.main.appSalt).update(value).digest('hex');
    }
}
