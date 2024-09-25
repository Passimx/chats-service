export class BooleanUtils {
    public static isArgumentTrue(value: unknown): boolean {
        return value === true || String(value).toLowerCase() === 'true' || value === '1' || value === 1;
    }

    public static strToBoolWithDefault(value: unknown, defaultValue = false): boolean {
        return value === undefined || value === null || typeof value === 'object'
            ? defaultValue
            : BooleanUtils.isArgumentTrue(value);
    }
}
