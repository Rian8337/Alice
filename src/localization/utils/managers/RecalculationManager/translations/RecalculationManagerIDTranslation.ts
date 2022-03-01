import { Translation } from "@alice-localization/base/Translation";
import { RecalculationManagerStrings } from "../RecalculationManagerLocalization";

/**
 * The Indonesian translation for the `RecalculationManager` manager utility.
 */
export class RecalculationManagerIDTranslation extends Translation<RecalculationManagerStrings> {
    override readonly translations: RecalculationManagerStrings = {
        recalculationSuccessful: "",
        recalculationFailed: "",
        userNotBinded: "",
        userHasAskedForRecalc: "",
        userDPPBanned: "",
    };
}
