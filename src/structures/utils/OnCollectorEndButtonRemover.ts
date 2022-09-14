import {
    Awaitable,
    ButtonInteraction,
    InteractionReplyOptions,
} from "discord.js";
import { CollectorState } from "./CollectorState";

/**
 * Represents a function to be called when a button collector ends.
 *
 * This function should remove or deactivate buttons present in the component.
 */
export interface OnCollectorEndButtonRemover {
    /**
     * @param collectorState The collector's state.
     * @param options The options that were used to send the initial message.
     */
    (
        collectorState: CollectorState<ButtonInteraction>,
        options: InteractionReplyOptions
    ): Awaitable<void>;
}
