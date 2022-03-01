import { Translation } from "@alice-localization/base/Translation";
import { RecalcStrings } from "../RecalcLocalization";

/**
 * The Indonesian translation for the `recalc` command.
 */
export class RecalcIDTranslation extends Translation<RecalcStrings> {
    override readonly translations: RecalcStrings = {
        tooManyOptions: "",
        userIsDPPBanned: "",
        userHasRequestedRecalc: "",
        userQueued: "",
        fullRecalcInProgress: "",
        fullRecalcTrackProgress: "",
        fullRecalcSuccess: "",
    };
}
