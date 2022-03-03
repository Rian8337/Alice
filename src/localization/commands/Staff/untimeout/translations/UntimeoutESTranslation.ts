import { Translation } from "@alice-localization/base/Translation";
import { UntimeoutStrings } from "../UntimeoutLocalization";

/**
 * The Spanish translation for the `untimeout` command.
 */
export class UntimeoutESTranslation extends Translation<UntimeoutStrings> {
    override readonly translations: UntimeoutStrings = {
        userCannotUntimeoutError:
            "Lo siento, no tienes los permisos para poder retirar la restricción al usuario.",
        untimeoutFailed:
            "Lo siento, no puedo retirar la restricción al usuario: %s.",
        untimeoutSuccessful: "Restricción retirada correctamente.",
    };
}
