import { AutocompleteHandler } from "@structures/core/AutocompleteHandler";
import { DroidHelper } from "@utils/helpers/DroidHelper";
import { PPVariantManager } from "@utils/managers/PPVariantManager";

export const run: AutocompleteHandler["run"] = async (_, interaction) => {
    const focused = interaction.options.getFocused(true);

    switch (focused.name) {
        case "username":
            interaction.respond(
                await DroidHelper.searchPlayersForAutocomplete(focused.value),
            );
            break;
        case "variant":
            interaction.respond(
                await PPVariantManager.searchForAutocomplete(focused.value, {
                    prototypeOnly: true,
                    actingUid: await PPVariantManager.getActingUid(
                        interaction.user,
                    ),
                }),
            );
            break;
    }
};

export const config: AutocompleteHandler["config"] = {
    name: "recalc",
};
