import { Translation } from "@localization/base/Translation";
import { RecalculationManagerStrings } from "../RecalculationManagerLocalization";

/**
 * The Spanish translation for the `RecalculationManager` manager utility.
 */
export class RecalculationManagerESTranslation extends Translation<RecalculationManagerStrings> {
    override readonly translations: RecalculationManagerStrings = {
        recalculationSuccessful: "%s, %s ha sido calculado correctamente.",
        recalculationFailed: "%s, el recalculo para %s falló: %s.",
        userNotBinded: "usuario no enlazado",
        userDPPBanned: "el usuario fue baneado de poder reclamar PP",
    };
}
