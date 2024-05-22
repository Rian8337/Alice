import { AnniversaryTriviaAttemptedQuestion } from "./AnniversaryTriviaAttemptedQuestion";

/**
 * Represents an attempt by a player in the anniversary trivia.
 */
export interface AnniversaryTriviaAttempt {
    /**
     * The marks achieved in this attempt.
     */
    marks: number;

    /**
     * The date of submission of this attempt.
     */
    submissionDate: Date;

    /**
     * The answers in this attempt.
     */
    readonly answers: AnniversaryTriviaAttemptedQuestion[];
}
