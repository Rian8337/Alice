import { Snowflake } from "discord.js";
import { FancyApplicationUserVote } from "./FancyApplicationUserVote";

/**
 * Represents a fancy application vote.
 */
export interface FancyApplicationVote {
    /**
     * The date at which the vote started.
     */
    readonly startsAt: Date;

    /**
     * The date at which the vote ends.
     */
    readonly endsAt: Date;

    /**
     * The ID of the message that contains the vote menu.
     */
    readonly messageId: Snowflake;

    /**
     * User votes in this fancy vote.
     */
    readonly votes: FancyApplicationUserVote[];
}
