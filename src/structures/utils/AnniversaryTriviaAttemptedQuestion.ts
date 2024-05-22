/**
 * Represents a question that was attempted in the anniversary trivia.
 */
export interface AnniversaryTriviaAttemptedQuestion {
    /**
     * The ID of the question.
     */
    readonly id: number;

    /**
     * The chosen answer.
     */
    answer: string;
}
