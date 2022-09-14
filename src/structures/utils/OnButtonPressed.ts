import {
    Awaitable,
    ButtonInteraction,
    InteractionCollector,
    InteractionReplyOptions,
} from "discord.js";

/**
 * Represents a function to be called when a button is pressed
 * in a limited time button collector.
 */
export interface OnButtonPressed {
    /**
     * @param collector The collector.
     * @param interaction The interaction with the button.
     * @param options The options that were used to send the initial message.
     */
    (
        collector: InteractionCollector<ButtonInteraction>,
        interaction: ButtonInteraction,
        options: InteractionReplyOptions
    ): Awaitable<void>;
}
