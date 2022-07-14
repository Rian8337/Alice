import { Snowflake } from "discord.js";
import { VoteChoice } from "structures/interactions/commands/Tools/VoteChoice";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a voting entry.
 */
export interface DatabaseVoting extends BaseDocument {
    /**
     * The ID of the Discord user who starts the vote.
     */
    initiator: Snowflake;

    /**
     * The Tatsu XP requirement to participate in this vote.
     */
    xpReq?: number;

    /**
     * The topic of the vote.
     */
    topic: string;

    /**
     * The ID of the channel where the vote is held.
     */
    channel: Snowflake;

    /**
     * The choices for the vote.
     */
    choices: VoteChoice[];
}
