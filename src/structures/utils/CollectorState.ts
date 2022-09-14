import { CollectedInteraction, InteractionCollector } from "discord.js";

/**
 * Represents the state of a collector.
 */
export interface CollectorState<T extends CollectedInteraction> {
    /**
     * The collector.
     */
    readonly collector: InteractionCollector<T>;

    /**
     * Whether the component was deleted.
     */
    componentIsDeleted: boolean;
}
