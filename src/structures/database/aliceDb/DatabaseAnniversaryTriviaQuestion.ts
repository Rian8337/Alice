import { BaseDocument } from "../BaseDocument";

/**
 * Represents a question for the anniversary trivia game.
 */
export interface DatabaseAnniversaryTriviaQuestion extends BaseDocument {
    /**
     * The ID of the question.
     */
    readonly id: number;

    /**
     * The question.
     */
    readonly question: string;

    /**
     * The answers to the question.
     */
    readonly answers: string[];

    /**
     * The correct answer to the question.
     */
    readonly correctAnswer: string;

    /**
     * The number of marks the question is worth.
     */
    readonly marks: number;
}
