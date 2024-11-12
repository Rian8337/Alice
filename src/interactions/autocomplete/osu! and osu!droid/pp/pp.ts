import { DatabaseManager } from "@database/DatabaseManager";
import { AutocompleteHandler } from "@structures/core/AutocompleteHandler";
import { DroidHelper } from "@utils/helpers/DroidHelper";

export const run: AutocompleteHandler["run"] = async (_, interaction) => {
    // Lots of autocomplete options for this command, but they're all usernames.
    // If other autocomplete option types were to be added in the future, option
    // names need to be considered.

    const focused = interaction.options.getFocused(true);

    if (interaction.options.getSubcommandGroup(false) === "prototype") {
        // There are two possible options for prototype: name and type of rework.
        switch (focused.name) {
            case "username":
                interaction.respond(
                    await DatabaseManager.aliceDb.collections.prototypePP.searchPlayersForAutocomplete(
                        focused.value,
                    ),
                );
                break;
            case "rework":
                interaction.respond(
                    await DatabaseManager.aliceDb.collections.prototypePPType.searchReworkTypesForAutocomplete(
                        focused.value,
                    ),
                );
                break;
        }
    } else {
        interaction.respond(
            await DroidHelper.searchPlayersForAutocomplete(focused.value),
        );
    }
};

export const config: AutocompleteHandler["config"] = {
    name: "pp",
};
