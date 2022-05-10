import { CommandInteraction } from "discord.js";
import { Bot } from "@alice-core/Bot";
import { Permission } from "@alice-types/core/Permission";

/**
 * Represents a subcommand.
 */
export interface Subcommand {
    /**
     * Executes the subcommand.
     *
     * @param client The instance of the bot.
     * @param message The interaction that executes the subcommand.
     */
    run(client: Bot, interaction: CommandInteraction): Promise<unknown>;

    /**
     * Configuration for the subcommand.
     */
    readonly config: {
        /**
         * The permissions this subcommand requires.
         *
         * This will only be enforced if the subcommand can only be executed in a guild channel or if the command can only be executed by bot owners.
         */
        readonly permissions: Permission[];

        /**
         * The cooldown for the subcommand, in seconds.
         */
        readonly cooldown?: number;

        /**
         * Whether to reply to this subcommand execution in private (only the executor can see it).
         */
        readonly replyEphemeral?: boolean;

        /**
         * Whether to instantly defer the interaction when running in debug mode. Defaults to `true`.
         *
         * Use this when interaction replies aren't getting through due to short response time.
         */
        readonly instantDeferInDebug?: boolean;
    };
}
