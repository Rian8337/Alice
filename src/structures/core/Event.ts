import { Bot } from "@alice-core/Bot";

/**
 * Defines an event.
 */
export interface Event {
    /**
     * Executes the event.
     *
     * @param client The instance of the bot.
     * @param args Additional arguments for the event.
     */
    run(client: Bot, ...args: unknown[]): Promise<void>;
}
