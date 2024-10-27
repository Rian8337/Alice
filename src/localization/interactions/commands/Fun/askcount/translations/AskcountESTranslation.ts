import { Translation } from "@localization/base/Translation";
import { AskcountStrings } from "../AskcountLocalization";

/**
 * The Spanish translation for the `askcount` command.
 */
export class AskcountESTranslation extends Translation<AskcountStrings> {
    override readonly translations: AskcountStrings = {
        haveNotAsked: "Lo siento! Parece que aun no me has preguntado nada.",
        askCount: "Me has preguntado %s veces.",
    };
}
