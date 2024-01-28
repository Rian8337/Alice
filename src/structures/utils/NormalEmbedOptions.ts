import { User, ColorResolvable } from "discord.js";

/**
 * Options to create a normal embed.
 */
export interface NormalEmbedOptions {
    /**
     * The author of the embed.
     */
    readonly author: User;

    /**
     * The color of the embed.
     */
    readonly color: ColorResolvable;

    /**
     * The footer text of the embed. If specified, will be written before bot's sign.
     */
    readonly footerText: string;

    /**
     * Whether to use a timestamp.
     */
    readonly timestamp: boolean;
}
