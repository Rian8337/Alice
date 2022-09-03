import { AutocompleteHandler } from "@alice-structures/core/AutocompleteHandler";
import { Manager } from "@alice-utils/base/Manager";
import { AutocompleteInteraction } from "discord.js";

/**
 * Helpers for autocompletes.
 */
export abstract class AutocompleteHelper extends Manager {
    /**
     * Runs a subcommand autocomplete handler.
     *
     * @param interaction The interaction.
     */
    static runSubcommandHandler(
        interaction: AutocompleteInteraction
    ): Promise<unknown> {
        return this.runSubOrGroupHandler(
            interaction,
            this.getSubcommandHandler(interaction)
        );
    }

    /**
     * Runs a subcommand group autocomplete handler.
     *
     * @param interaction The interaction.
     */
    static runSubcommandGroupHandler(
        interaction: AutocompleteInteraction
    ): Promise<unknown> {
        return this.runSubOrGroupHandler(
            interaction,
            this.getSubcommandGroupHandler(interaction)
        );
    }

    /**
     * Gets the subcommand autocomplete handler that is run by the user via an interaction.
     *
     * @param interaction The interaction.
     * @returns The handler, if found.
     */
    static getSubcommandHandler(
        interaction: AutocompleteInteraction
    ): AutocompleteHandler | null {
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
     * Gets the subcommand group autocomplete handler that is run by the user via an interaction.
     *
     * @param interaction The interaction.
     * @returns The handler, if found.
     */
    static getSubcommandGroupHandler(
        interaction: AutocompleteInteraction
    ): AutocompleteHandler | null {
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
    private static runSubOrGroupHandler(
        interaction: AutocompleteInteraction,
        handler: AutocompleteHandler | null
    ): Promise<unknown> {
        if (!handler) {
            return interaction.respond([]);
        }

        return handler.run(this.client, interaction);
    }
}
