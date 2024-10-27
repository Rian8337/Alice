import { DatabaseManager } from "@database/DatabaseManager";
import { AutocompleteHandler } from "@structures/core/AutocompleteHandler";

export const run: AutocompleteHandler["run"] = async (_, interaction) => {
    const focused = interaction.options.getFocused(true);

    switch (focused.name) {
        case "username":
            interaction.respond(
                await DatabaseManager.elainaDb.collections.userBind.searchPlayersForAutocomplete(
                    focused.value,
                ),
            );
            break;
        case "reworktype":
            interaction.respond(
                await DatabaseManager.aliceDb.collections.prototypePPType.searchReworkTypesForAutocomplete(
                    focused.value,
                ),
            );
            break;
    }
};

export const config: AutocompleteHandler["config"] = {
    name: "recalc",
};
