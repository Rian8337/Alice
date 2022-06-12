import { Collection } from "discord.js";
import { SlashCommand } from "./SlashCommand";
import { SlashSubcommand } from "./SlashSubcommand";

/**
 * Represents a command that is cached.
 */
export interface CachedSlashCommand extends SlashCommand {
    /**
     * The subcommand groups that this command has, mapped by its name.
     */
    readonly subcommandGroups: Collection<string, SlashSubcommand>;

    /**
     * The subcommands that this command has, mapped by its name.
     */
    readonly subcommands: Collection<string, SlashSubcommand>;
}
