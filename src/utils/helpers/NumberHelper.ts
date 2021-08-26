import { MathUtils } from "osu-droid";

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
    static isNumberInRange(num: number, min: number, max: number, inclusive?: boolean): boolean {
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
    static isNumeric(value: any): boolean {
        return !isNaN(value - parseFloat(value));
    }
}