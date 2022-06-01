import { User } from "discord.js";

/**
 * Represents a cached trivia answer.
 */
export interface TriviaCachedAnswer {
    /**
     * The user who answered.
     */
    readonly user: User;

    /**
     * The answer.
     */
    readonly answer: string;

    /**
     * The UNIX time at which the answer was submitted, in milliseconds.
     */
    readonly submissionTime: number;
}
