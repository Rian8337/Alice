import { DMChannel, NewsChannel, TextChannel, ThreadChannel } from "discord.js";

/**
 * Channels where users can type.
 */
export type TextBasedChannel =
    | DMChannel
    | TextChannel
    | NewsChannel
    | ThreadChannel;
