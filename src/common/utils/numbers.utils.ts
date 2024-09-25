export class NumbersUtils {
    public static readonly INTEGER_MAX = 2147483647;
    public static readonly INTEGER_MIN = -2147483648;

    public static toNumberOrDefault(value: unknown, defaultValue: number): number {
        const number = Number(value);

        return value === undefined || value === null || typeof value === 'object' || isNaN(number)
            ? defaultValue
            : number;
    }
}
