import { Vector2 } from "../mathutil/Vector2";

/**
 * Precision utilities.
 */
export abstract class Precision {
    static readonly FLOAT_EPSILON: number = 1e-3;

    /**
     * Checks if two numbers are equal with a given tolerance.
     *
     * @param value1 The first number.
     * @param value2 The second number.
     * @param acceptableDifference The acceptable difference as threshold. Default is `Precision.FLOAT_EPSILON = 1e-3`.
     */
    static almostEqualsNumber(
        value1: number,
        value2: number,
        acceptableDifference: number = this.FLOAT_EPSILON
    ): boolean {
        return Math.abs(value1 - value2) <= acceptableDifference;
    }

    /**
     * Checks if two vectors are equal with a given tolerance.
     *
     * @param vec1 The first vector.
     * @param vec2 The second vector.
     * @param acceptableDifference The acceptable difference as threshold. Default is `Precision.FLOAT_EPSILON = 1e-3`.
     */
    static almostEqualsVector(
        vec1: Vector2,
        vec2: Vector2,
        acceptableDifference: number = this.FLOAT_EPSILON
    ): boolean {
        return (
            this.almostEqualsNumber(vec1.x, vec2.x, acceptableDifference) &&
            this.almostEqualsNumber(vec1.y, vec2.y, acceptableDifference)
        );
    }
}
