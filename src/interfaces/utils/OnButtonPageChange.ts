import { MessageOptions } from "discord.js";

/**
 * Represents a function to be called when page change occurs
 * in button-based paging.
 */
export interface OnButtonPageChange {
    /**
     * @param options The options that will be used to edit the message.
     * @param page The current page.
     * @param contents The contents to be displayed in the page. This is automatically provided by the utility.
     * @param args Additional arguments for the function.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (
        options: MessageOptions,
        page: number,
        contents: any[],
        ...args: any[]
    ): Promise<any>;
}
