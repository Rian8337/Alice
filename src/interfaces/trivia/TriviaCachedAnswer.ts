import { User } from "discord.js";

/**
 * Represents a cached trivia answer.
 */
export interface TriviaCachedAnswer {
    /**
     * The user who answered.
     */
    readonly user: User;
}
