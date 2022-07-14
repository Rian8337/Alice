import { TriviaCachedAnswer } from "./TriviaCachedAnswer";

/**
 * Represents a cached trivia question answer.
 */
export interface TriviaQuestionCachedAnswer extends TriviaCachedAnswer {
    /**
     * The answer.
     */
    readonly answer: string;

    /**
     * The UNIX time at which the answer was submitted, in milliseconds.
     */
    readonly submissionTime: number;
}
