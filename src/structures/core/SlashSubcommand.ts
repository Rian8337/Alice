import {
    ChatInputCommandInteraction,
    If,
    StringSelectMenuInteraction,
} from "discord.js";
import { Bot } from "@core/Bot";
import { Permission } from "structures/core/Permission";

/**
 * Represents a slash command's subcommand.
 */
export interface SlashSubcommand<FromInteraction extends boolean = boolean> {
    /**
     * Executes the subcommand.
     *
     * @param client The instance of the bot.
     * @param interaction The interaction that executes the subcommand.
     * @param args Extra arguments for the subcommand.
     */
    run(
        client: Bot,
        interaction: If<
            FromInteraction,
            ChatInputCommandInteraction,
            StringSelectMenuInteraction
        >,
        ...args: unknown[]
    ): Promise<unknown>;

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
