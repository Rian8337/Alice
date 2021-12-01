import { MathEquation } from "@alice-interfaces/utils/MathEquation";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";

/**
 * A generator to create math equations.
 */
export class MathEquationCreator {
    /**
     * Creates a math equation.
     *
     * @param level The difficulty of the equation.
     * @param operatorAmount The amount of operators in the equation.
     * @returns The created equation along with its answer.
     */
    static createEquation(level: number, operatorAmount: number): MathEquation {
        const operators: string[] = ["/", "*", "+", "-"];
        const prevOperatorAmount: number = NumberHelper.clamp(
            operatorAmount,
            1,
            10
        );
        let equation: string = "";
        let realEquation: string = "";
        let answer: number = Number.NaN;
        let primeCount: number = 0;
        let lastOperator: string = "";
        let attempts: number = 0;
        const maxThreshold: number = 10 * level * operatorAmount;
        const minThreshold: number = maxThreshold / 2;

        while (!Number.isInteger(answer)) {
            // We don't want to keep the loop going for a long time, so just limit it to 500 attempts
            if (attempts === 500) {
                break;
            }

            while (operatorAmount--) {
                const operator: string =
                    ArrayHelper.getRandomArrayElement(operators);

                let number: number = this.generateNumber(level, operator);
                const mulOrDiv: boolean =
                    operator === "/" ||
                    operator === "*" ||
                    lastOperator === "/" ||
                    lastOperator === "*";

                if (mulOrDiv) {
                    while (
                        !this.isPrime(number) &&
                        primeCount < Math.floor(level / 10)
                    ) {
                        number = this.generateNumber(level, operator);
                    }
                    ++primeCount;
                }
                // Use RNG to determine putting factorial
                const factorial: boolean =
                    level >= 11 && level + Math.random() * level >= 20;
                if (factorial) {
                    while (number < 2 || number > 4) {
                        number = this.generateNumber(level, "!");
                    }

                    equation += `${this.calculateFactorial(
                        number
                    )} ${operator} `;
                    realEquation += `${number}! ${operator} `;
                } else {
                    equation += `${number} ${operator} `;
                    realEquation += `${number} ${operator} `;
                }

                lastOperator = operator;
            }

            let number: number = this.generateNumber(level, lastOperator);
            const mulOrDiv: boolean =
                lastOperator === "/" || lastOperator === "*";
            if (mulOrDiv) {
                while (
                    !this.isPrime(number) &&
                    primeCount < Math.floor(level / 5)
                ) {
                    number = this.generateNumber(level, lastOperator);
                }
            }

            // Use RNG to determine putting factorial
            const factorial: boolean =
                level >= 11 && Math.random() >= 1 - level / 25;
            if (factorial) {
                while (number < 2 || number > 4) {
                    number = this.generateNumber(level, "!");
                }

                equation += this.calculateFactorial(number);
                realEquation += `${number}!`;
            } else {
                equation += number;
                realEquation += number;
            }

            answer = eval(equation);

            const minMulDivThreshold: number = Math.min(
                operatorAmount + 1,
                Math.floor(level / 10)
            );
            const maxMulDivThreshold: number = level / 5;
            const mulDivAmount: number = (equation.match(/[/*]/g) || []).length;

            if (
                !Number.isInteger(answer) ||
                // Checks if multiplication or division amount is within threshold range
                (level >= 5 &&
                    mulDivAmount < minMulDivThreshold &&
                    mulDivAmount > maxMulDivThreshold) ||
                // Checks if min < answer < max for positive value
                (answer > 0 &&
                    (answer > maxThreshold || answer < minThreshold)) ||
                // Checks if -max < answer < -min for negative value
                (answer < 0 &&
                    (answer < -maxThreshold || answer > -minThreshold))
            ) {
                answer = Number.NaN;
                equation = "";
                realEquation = "";
                operatorAmount = prevOperatorAmount;
            }

            ++attempts;
        }

        return {
            equation: equation,
            realEquation: realEquation,
            answer: answer,
        };
    }

    /**
     * Generates a number based on given operator.
     *
     * @param level The difficulty of the equation.
     * @param operator The operator to generate the number for.
     * @returns The generated number.
     */
    private static generateNumber(level: number, operator: string): number {
        switch (operator) {
            case "+":
            case "-":
                return this.createRandomNumber(
                    Math.random() * 2.5 * level,
                    Math.max(2.5 * level, Math.random() * 7.5 * level)
                );
            case "/":
            case "*":
                return this.createRandomNumber(
                    Math.random() *
                        5 *
                        Math.max(1, (Math.random() * level) / 2),
                    Math.random() *
                        10 *
                        Math.max(1, (Math.random() * level) / 2)
                );
            default:
                return this.createRandomNumber(
                    (Math.random() * (level - 10)) / 5,
                    Math.random() *
                        3 *
                        Math.max(
                            1 + (level - 10) / 5,
                            (Math.random() * (level - 10)) / 5
                        )
                );
        }
    }

    /**
     * Generates a random number.
     *
     * @param min The minimum threshold of the number.
     * @param max The maximum threshold of the number.
     * @returns The generated number.
     */
    private static createRandomNumber(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.max(1, Math.floor(Math.random() * (max - min + 1)) + min);
    }

    /**
     * Checks if a number is a prime number.
     *
     * @param num The number to check.
     * @returns Whether the number is a prime number.
     */
    private static isPrime(num: number): boolean {
        if (num < 2) {
            return false;
        }

        for (let i = 2; i < Math.floor(Math.sqrt(num)); ++i) {
            if (num % i === 0) return false;
        }

        return true;
    }

    /**
     * Calculates the factorial value of a number.
     *
     * @param num The number to calculate.
     * @returns The calculated factrial value.
     */
    private static calculateFactorial(num: number): number {
        let result = num;
        while (num > 1) {
            --num;
            result *= num;
        }
        return result;
    }
}
