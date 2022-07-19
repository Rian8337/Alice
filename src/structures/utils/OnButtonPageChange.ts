import { InteractionReplyOptions } from "discord.js";

/**
 * Represents a function to be called when page change occurs
 * in button-based paging.
 */
export interface OnButtonPageChange {
    /**
     * @param options The options that will be used to edit the message.
     * @param page The current page.
     * @param args Additional arguments for the function.
     */
    (
        options: InteractionReplyOptions,
        page: number,
        ...args: unknown[]
    ): Promise<void>;
}
