import { AutocompleteInteraction, Interaction } from "discord.js";

/**
 * Represents an interaction that can be replied to.
 */
export type RepliableInteraction = Exclude<
    Interaction,
    AutocompleteInteraction
>;
