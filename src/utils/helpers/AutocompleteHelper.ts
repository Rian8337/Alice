import { AutocompleteSubhandler } from "@structures/core/AutocompleteSubhandler";
import { Manager } from "@utils/base/Manager";
import { AutocompleteInteraction } from "discord.js";

/**
 * Helpers for autocompletes.
 */
export abstract class AutocompleteHelper extends Manager {
    /**
     * Runs an autocomplete subhandler from a slash command that uses a subcommand.
     *
     * @param interaction The interaction.
     */
    static runSubcommandSubhandler(
        interaction: AutocompleteInteraction,
    ): Promise<unknown> {
        return this.runSubOrGroupSubhandler(
            interaction,
            this.getSubcommandSubhandler(interaction),
        );
    }

    /**
     * Runs an autocomplete subhandler from a slash command that uses a subcommand group.
     *
     * @param interaction The interaction.
     */
    static runSubcommandGroupSubhandler(
        interaction: AutocompleteInteraction,
    ): Promise<unknown> {
        return this.runSubOrGroupSubhandler(
            interaction,
            this.getSubcommandGroupSubhandler(interaction),
        );
    }

    /**
     * Gets the subcommand autocomplete subhandler that is run by the user via an interaction.
     *
     * @param interaction The interaction.
     * @returns The handler, if found.
     */
    static getSubcommandSubhandler(
        interaction: AutocompleteInteraction,
    ): AutocompleteSubhandler | null {
        if (!interaction.options.getSubcommand(false)) {
            return null;
        }

        const subcommandFileName: string = [
            interaction.commandName,
            interaction.options.getSubcommandGroup(false) ?? "",
            interaction.options.getSubcommand(),
        ]
            .filter(Boolean)
            .join("-");

        return (
            this.client.interactions.autocomplete
                .get(interaction.commandName)
                ?.subcommands.get(subcommandFileName) ?? null
        );
    }

    /**
     * Gets the subcommand group autocomplete subhandler that is run by the user via an interaction.
     *
     * @param interaction The interaction.
     * @returns The handler, if found.
     */
    static getSubcommandGroupSubhandler(
        interaction: AutocompleteInteraction,
    ): AutocompleteSubhandler | null {
        if (!interaction.options.getSubcommandGroup(false)) {
            return null;
        }

        const subcommandFileName: string = [
            interaction.commandName,
            interaction.options.getSubcommandGroup(),
        ]
            .filter(Boolean)
            .join("-");

        return (
            this.client.interactions.autocomplete
                .get(interaction.commandName)
                ?.subcommandGroups.get(subcommandFileName) ?? null
        );
    }

    /**
     * Runs a subcommand or subcommand group handler.
     *
     * @param interaction The interaction.
     * @param handler The handler to run.
     */
    private static runSubOrGroupSubhandler(
        interaction: AutocompleteInteraction,
        handler: AutocompleteSubhandler | null,
    ): Promise<unknown> {
        if (!handler) {
            return interaction.respond([]);
        }

        return handler.run(this.client, interaction);
    }
}
