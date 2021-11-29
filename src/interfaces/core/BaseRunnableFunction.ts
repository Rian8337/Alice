import { Bot } from "@alice-core/Bot";

export interface BaseRunnableFunction {
    /**
     * @param client The instance of the bot.
     * @param args Additional arguments for the runnable.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client: Bot, ...args: any[]): Promise<any>;
}