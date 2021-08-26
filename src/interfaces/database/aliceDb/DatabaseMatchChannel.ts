import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a binded match channel for a tournament match.
 */
export interface DatabaseMatchChannel extends BaseDocument {
    /**
     * The ID of the channel.
     */
    channelid: Snowflake;

    /**
     * The ID of the match.
     */
    matchid: string;
};