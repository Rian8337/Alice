/**
 * 2D point operations are stored in this class.
 */
export class Vector {
    /**
     * The x position of the vector.
     */
    public x: number;
    
    /**
     * The y position of the vector.
     */
    public y: number;

    constructor(values: {
        x: number,
        y: number
    }) {
        this.x = values.x;
        this.y = values.y;
    }

    /**
     * Multiplies 2 vectors.
     */
    static multiply(vector1: Vector, vector2: Vector): Vector {
        return new Vector({x: vector1.x * vector2.x, y: vector1.y * vector2.y});
    }

    /**
     * Subtracts 2 vectors.
     */
    static subtract(vector1: Vector, vector2: Vector): Vector {
        return new Vector({x: vector1.x - vector2.x, y: vector1.y - vector2.y});
    }

    /**
     * Gets the length of a vector.
     */
    static getLength(vector: Vector): number {
        return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
    }

    /**
     * Performs a dot multiplication of 2 vectors.
     */
    static dot(vector1: Vector, vector2: Vector): number {
        return vector1.x * vector2.x + vector1.y * vector2.y;
    }
}