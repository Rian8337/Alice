/**
 * Based on `Vector2` class in C#.
 */
export class Vector2 {
    /**
     * The x position of the vector.
     */
    x: number;

    /**
     * The y position of the vector.
     */
    y: number;

    constructor(values: { x: number; y: number }) {
        this.x = values.x;
        this.y = values.y;
    }

    /**
     * Multiplies the vector with another vector.
     */
    multiply(vec: Vector2): Vector2 {
        return new Vector2({ x: this.x * vec.x, y: this.y * vec.y });
    }

    divide(divideFactor: number): Vector2 {
        if (divideFactor === 0) {
            throw new Error("Division by 0");
        }
        return new Vector2({
            x: this.x / divideFactor,
            y: this.y / divideFactor,
        });
    }

    /**
     * Adds the vector with another vector.
     */
    add(vec: Vector2): Vector2 {
        return new Vector2({ x: this.x + vec.x, y: this.y + vec.y });
    }

    /**
     * Subtracts the vector with another vector.
     */
    subtract(vec: Vector2): Vector2 {
        return new Vector2({ x: this.x - vec.x, y: this.y - vec.y });
    }

    /**
     * The length of the vector.
     */
    get length(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    /**
     * Performs a dot multiplication with another vector.
     */
    dot(vec: Vector2): number {
        return this.x * vec.x + this.y * vec.y;
    }

    /**
     * Scales the vector.
     */
    scale(scaleFactor: number): Vector2 {
        return new Vector2({
            x: this.x * scaleFactor,
            y: this.y * scaleFactor,
        });
    }

    /**
     * Gets the distance between this vector and another vector.
     */
    getDistance(vec: Vector2): number {
        const x: number = this.x - vec.x;
        const y: number = this.y - vec.y;
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    }

    /**
     * Normalizes the vector.
     */
    normalize(): void {
        const length: number = this.length;
        this.x /= length;
        this.y /= length;
    }

    /**
     * Checks whether this vector is equal to another vector.
     *
     * @param other The other vector.
     */
    equals(other: Vector2): boolean {
        return this.x === other.x && this.y === other.y;
    }
}
