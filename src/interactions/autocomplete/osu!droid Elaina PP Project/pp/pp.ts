import { DatabaseManager } from "@alice-database/DatabaseManager";
import { AutocompleteHandler } from "@alice-structures/core/AutocompleteHandler";

export const run: AutocompleteHandler["run"] = async (_, interaction) => {
    // Lots of autocomplete options for this command, but they're all usernames.
    // If other autocomplete option types were to be added in the future, option
    // names need to be considered.

    const focusedValue: string = interaction.options.getFocused();

    if (
        interaction.options.getSubcommandGroup(false) === "prototype" &&
        interaction.options.getSubcommand(false) === "export"
    ) {
        interaction.respond(
            await DatabaseManager.aliceDb.collections.prototypePP.searchPlayersForAutocomplete(
                focusedValue
            )
        );
    } else {
        interaction.respond(
            await DatabaseManager.elainaDb.collections.userBind.searchPlayersForAutocomplete(
                focusedValue
            )
        );
    }
};

export const config: AutocompleteHandler["config"] = {
    name: "pp",
};
