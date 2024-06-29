import { Translation } from "@alice-localization/base/Translation";
import { RecalcStrings } from "../RecalcLocalization";

/**
 * The English translation for the `recalc` command.
 */
export class RecalcENTranslation extends Translation<RecalcStrings> {
    override readonly translations: RecalcStrings = {
        tooManyOptions:
            "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
        reworkNameMissing: "I'm sorry, you did not specify a rework name!",
        reworkTypeDoesntExist: "I'm sorry, this rework type does not exist!",
        userIsDPPBanned: "I'm sorry, this user has been DPP banned!",
        userHasRequestedRecalc:
            "I'm sorry, this user has already requested a recalculation before!",
        userQueued: "Successfully queued %s for recalculation.",
        fullRecalcInProgress: "Successfully started recalculation.",
        fullRecalcTrackProgress: "Recalculating players (%s/%s (%s%))...",
        fullRecalcSuccess: "%s, recalculation done!",
    };
}
