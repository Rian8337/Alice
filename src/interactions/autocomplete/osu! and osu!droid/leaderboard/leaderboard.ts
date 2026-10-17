import { AutocompleteHandler } from "@structures/core/AutocompleteHandler";
import { PPVariantManager } from "@utils/managers/PPVariantManager";

export const run: AutocompleteHandler["run"] = async (_, interaction) => {
    // There is only one option - variant, so we can just return the result directly
    interaction.respond(
        await PPVariantManager.searchForAutocomplete(
            interaction.options.getFocused(),
            {
                prototypeOnly: true,
                actingUid: await PPVariantManager.getActingUid(
                    interaction.user,
                ),
            },
        ),
    );
};

export const config: AutocompleteHandler["config"] = {
    name: "leaderboard",
};
