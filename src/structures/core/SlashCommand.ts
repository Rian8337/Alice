import {
    ApplicationCommandOptionData,
    ChatInputCommandInteraction,
} from "discord.js";
import { Bot } from "@alice-core/Bot";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { CommandScope } from "structures/core/CommandScope";
import { Permission } from "structures/core/Permission";

/**
 * Represents a slash command.
 */
export interface SlashCommand {
    /**
     * Executes the command.
     *
     * @param client The instance of the bot.
     * @param interaction The interaction that executes the command.
     */
    run(
        client: Bot,
        interaction: ChatInputCommandInteraction
    ): Promise<unknown>;

    /**
     * The category of the command.
     */
    readonly category: CommandCategory;

    /**
     * Configurations for the command.
     */
    readonly config: {
        /**
         * The name of the command.
         */
        readonly name: string;

        /**
         * The description of the command.
         */
        readonly description: string;

        /**
         * The options of the command.
         *
         * This is used to define command arguments and subcommands.
         */
        readonly options: ApplicationCommandOptionData[];

        /**
         * The usage example of the command.
         */
        readonly example: {
            /**
             * The command usage example that will give the desired output outlined in description.
             */
            readonly command: string;

            /**
             * The arguments of the command.
             */
            readonly arguments?: {
                /**
                 * The name of the argument.
                 */
                readonly name: string;

                /**
                 * The value of the argument.
                 */
                readonly value: string | number | boolean;
            }[];

            /**
             * The description about what the command usage example will do.
             */
            readonly description: string;
        }[];

        /**
         * The permissions this command requires.
         *
         * This will only be enforced if the command can only be executed in a guild channel or if the command can only be executed by bot owners.
         */
        readonly permissions: Permission[];

        /**
         * The scope of the command (where the command can be executed).
         */
        readonly scope: CommandScope;

        /**
         * The cooldown for the command, in seconds.
         */
        readonly cooldown?: number;

        /**
         * Whether to reply to this command execution in private (only the executor can see it).
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
