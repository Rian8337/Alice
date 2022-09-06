import { AutocompleteHandler } from "@alice-structures/core/AutocompleteHandler";
import { StringHelper } from "@alice-utils/helpers/StringHelper";

export const run: AutocompleteHandler["run"] = async (client, interaction) => {
    const focusedValue: string = interaction.options.getFocused();

    const regExp: RegExp = new RegExp(
        StringHelper.escapeRegexCharacters(focusedValue),
        "i"
    );

    interaction.respond(
        [...client.interactions.chatInput.keys()]
            .filter((v) => regExp.test(v))
            .slice(0, 25)
            .map((v) => {
                return {
                    name: v,
                    value: v,
                };
            })
    );
};

export const config: AutocompleteHandler["config"] = {
    name: "help",
};
