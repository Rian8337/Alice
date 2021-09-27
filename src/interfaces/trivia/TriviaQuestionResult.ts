import { User } from "discord.js";

/**
 * Represents a trivia question's result.
 */
export interface TriviaQuestionResult {
    /**
     * The correct answer of this trivia question.
     */
    readonly correctAnswers: string[];

    /**
     * The results of this trivia question.
     */
    readonly results: {
        /**
         * The user.
         */
        readonly user: User;

        /**
         * The time taken by the user to answer the question correctly, in milliseconds.
         */
        readonly timeTaken: number;
    }[];
};