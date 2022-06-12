import { Translation } from "@alice-localization/base/Translation";
import { SwitchbindStrings } from "../SwitchbindLocalization";

/**
 * The Spanish translation of the `switchbind` command.
 */
export class SwitchbindESTranslation extends Translation<SwitchbindStrings> {
    override readonly translations: SwitchbindStrings = {
        invalidUid: "Hey, por favor ingresa un uid válido!",
        uidNotBinded: "Lo siento, ese uid no esta asociado a nadie!",
        switchFailed: "Lo siento, no puedo cambiar el enlace: %s.",
        switchSuccessful: "Enlace cambiado correctamente.",
    };
}
