import { MessageCreator } from "@utils/creators/MessageCreator";
import { inlineCode } from "discord.js";
import { VariantRejectionKey } from "./variantChoice";

/**
 * Creates the message that rejects a variant.
 *
 * The typed variant name is always wrapped in an inline code block, so that it cannot format the message.
 *
 * @param localization The localization of the command.
 * @param key The localization key of the rejection, from `variantRejectionKey`.
 * @param variantName The variant name that the user typed.
 * @param modeName The name of the gamemode that the variant was expected to calculate.
 * @returns The rejection message.
 */
export function createVariantRejection<TKey extends VariantRejectionKey>(
    localization: { getTranslation: (key: NoInfer<TKey>) => string },
    key: TKey,
    variantName: string,
    modeName: string,
): string {
    const translation = localization.getTranslation(key);

    // A backtick would end the code block early.
    const name = inlineCode(variantName.replaceAll("`", "'"));

    switch (key) {
        case "variantListUnavailable":
            return MessageCreator.createReject(translation);
        case "variantWrongMode":
            return MessageCreator.createReject(translation, name, modeName);
        default:
            return MessageCreator.createReject(translation, name);
    }
}
