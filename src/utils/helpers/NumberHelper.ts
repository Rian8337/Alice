import { MathUtils } from "@rian8337/osu-base";

/**
 * Helper methods for numbers.
 */
export abstract class NumberHelper extends MathUtils {
    /**
     * Determines whether a number is in a specific range.
     *
     * @param num The number to determine.
     * @param min The minimum value of the range.
     * @param max The maximum value of the range.
     * @param inclusive Whether the range is inclusive.
     * @returns A boolean determining whether the number is in range.
     */
    static isNumberInRange(
        num: number,
        min: number,
        max: number,
        inclusive?: boolean
    ): boolean {
        if (inclusive) {
            return num >= min && num <= max;
        } else {
            return num > min && num < max;
        }
    }

    /**
     * Checks if a value is a numeric value.
     *
     * @param value The value.
     * @returns Whether the value is a numeric value.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static isNumeric(value: any): value is number {
        return !isNaN(value - parseFloat(value));
    }

    /**
     * Checks whether a number is positive.
     *
     * @param num The number.
     * @returns Whether the number is positive.
     */
    static isPositive(num: number): boolean {
        return this.isNumberInRange(num, 0, Number.POSITIVE_INFINITY);
    }
}
