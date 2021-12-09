/**
 * Some math utility functions.
 */
export abstract class MathUtils {
    /**
     * Rounds a specified number with specified amount of fractional digits.
     *
     * @param num The number to round.
     * @param fractionalDigits The amount of fractional digits.
     */
    static round(num: number, fractionalDigits: number): number {
        return parseFloat(num.toFixed(fractionalDigits));
    }

    /**
     * Limits the specified number on range `[min, max]`.
     *
     * @param num The number to limit.
     * @param min The minimum range.
     * @param max The maximum range.
     */
    static clamp(num: number, min: number, max: number): number {
        return Math.max(min, Math.min(num, max));
    }

    /**
     * Calculates the standard deviation of given data.
     *
     * @param data The data to calculate.
     */
    static calculateStandardDeviation(data: number[]): number {
        if (data.length === 0) {
            return 0;
        }
        const mean: number =
            data.reduce((acc, value) => acc + value) / data.length;

        return Math.sqrt(
            data.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) /
                data.length
        );
    }
}
