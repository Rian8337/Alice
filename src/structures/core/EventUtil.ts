import { Bot } from "@alice-core/Bot";
import { EventUtilToggleScope } from "structures/core/EventUtilToggleScope";
import { Permission } from "structures/core/Permission";

/**
 * Defines an event utility.
 */
export interface EventUtil {
    /**
     * Executes the event utility.
     *
     * @param client The instance of the bot.
     * @param args Additional arguments for the event utility.
     */
    run(client: Bot, ...args: unknown[]): Promise<unknown>;

    /**
     * Configurations for this event utility.
     */
    readonly config: {
        /**
         * The description of this event utility.
         */
        readonly description: string;

        /**
         * The permissions needed to toggle thi event utility.
         */
        readonly togglePermissions: Permission[];

        /**
         * The scopes at which this event utility can be disabled/enabled.
         */
        readonly toggleScope: EventUtilToggleScope[];

        /**
         * Whether this event utility will be enabled in debug mode.
         */
        readonly debugEnabled?: boolean;
    };
}
