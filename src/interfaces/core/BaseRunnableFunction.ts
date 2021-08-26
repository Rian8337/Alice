import { Bot } from "@alice-core/Bot";

export interface BaseRunnableFunction {
    /**
     * @param client The instance of the bot.
     * @param args Additional arguments for the runnable.
     */
    (client: Bot, ...args: any[]): Promise<any>;
};