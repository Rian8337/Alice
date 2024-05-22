import { AnniversaryTriviaAttemptedQuestion } from "./AnniversaryTriviaAttemptedQuestion";

/**
 * Represents a question that was attempted in the anniversary trivia.
 */
export interface AnniversaryTriviaCurrentAttemptQuestion
    extends AnniversaryTriviaAttemptedQuestion {
    /**
     * Whether the question is flagged.
     */
    flagged: boolean;
}
