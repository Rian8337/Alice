import { Snowflake } from "discord-api-types";

/**
 * Represents a player in map trivia.
 */
export interface MapTriviaPlayer {
    /**
     * The Discord ID of this player.
     */
    readonly id: Snowflake;

    /**
     * The amount of score that this player has.
     */
    score: number;

    /**
     * This player's lives.
     */
    lives: number;
}
