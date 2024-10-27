import { Translation } from "@localization/base/Translation";
import { UnbindStrings } from "../UnbindLocalization";

/**
 * The Spanish translation for the `unbind` command.
 */
export class UnbindESTranslation extends Translation<UnbindStrings> {
    override readonly translations: UnbindStrings = {
        invalidUid: "Hey, por favor ingresa un uid válido!",
        uidNotBinded: "Lo siento, ese uid no esta asociado a nadie!",
        unbindFailed: "Lo siento, no puedo desenlazar el uid: %s",
        unbindSuccessful: "Uid %s desenlazado correctamente.",
    };
}
