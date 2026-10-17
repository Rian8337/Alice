import { DatabaseManager } from "@database/DatabaseManager";
import { AutocompleteHandler } from "@structures/core/AutocompleteHandler";
import { DroidHelper } from "@utils/helpers/DroidHelper";
import { PPVariantManager } from "@utils/managers/PPVariantManager";

export const run: AutocompleteHandler["run"] = async (_, interaction) => {
    // Lots of autocomplete options for this command, but they're all usernames.
    // If other autocomplete option types were to be added in the future, option
    // names need to be considered.

    const focused = interaction.options.getFocused(true);

    if (interaction.options.getSubcommandGroup(false) === "prototype") {
        // There are two possible options for prototype: username and variant.
        switch (focused.name) {
            case "username":
                interaction.respond(
                    await DatabaseManager.aliceDb.collections.prototypePP.searchPlayersForAutocomplete(
                        focused.value,
                    ),
                );
                break;
            case "variant":
                interaction.respond(
                    await PPVariantManager.searchForAutocomplete(
                        focused.value,
                        {
                            prototypeOnly: true,
                            actingUid: await PPVariantManager.getActingUid(
                                interaction.user,
                            ),
                        },
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
