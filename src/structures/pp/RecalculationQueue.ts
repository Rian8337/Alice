import { CommandInteraction } from "discord.js";

/**
 * Represents a recalculation queue entry.
 */
export interface RecalculationQueue {
    /**
     * The interaction that triggered the recalculation.
     */
    readonly interaction: CommandInteraction;

    /**
     * The uid of the player.
     */
    readonly uid: number;

    /**
     * The canonical name of the variant to recalculate with.
     */
    readonly variant: string;

    /**
     * The uid of the player that the recalculation is made on behalf of, if any.
     */
    readonly actingUid?: number;
}
