/**
 * Represents an equation created by the math equation generator.
 */
export interface MathEquation {
    /**
     * The math equation.
     * 
     * This can be evaluated using `eval()`.
     */
    equation: string;

    /**
     * The math equation that can be displayed to the user.
     */
    realEquation: string;

    /**
     * The answer to the equation.
     */
    answer: number;
}