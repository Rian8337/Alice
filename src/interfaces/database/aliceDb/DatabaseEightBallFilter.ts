import { BaseDocument } from "../BaseDocument";

/**
 * Represents a filter for 8ball responses.
 */
export interface DatabaseEightBallFilter extends BaseDocument {
    /**
     * The name of the filter.
     */
    name: string;

    /**
     * Sentences that the bot likes.
     */
    like: string[];

    /**
     * Sentences that the bot hates.
     */
    hate: string[];

    /**
     * A list of bad words that is not appropriate.
     */
    badwords: string[];

    /**
     * Sentences used to respond to an 8ball.
     */
    response: string[];
}
