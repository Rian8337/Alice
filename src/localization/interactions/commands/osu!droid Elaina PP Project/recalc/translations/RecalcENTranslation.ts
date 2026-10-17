import { Translation } from "@localization/base/Translation";
import { RecalcStrings } from "../RecalcLocalization";

/**
 * The English translation for the `recalc` command.
 */
export class RecalcENTranslation extends Translation<RecalcStrings> {
    override readonly translations: RecalcStrings = {
        playerNotFound:
            "I'm sorry, I cannot find the player that you are looking for!",
        tooManyOptions:
            "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
        variantNotFound: "I'm sorry, I cannot find the variant %s!",
        variantWrongMode: "I'm sorry, %s is not a %s variant!",
        variantListUnavailable:
            "I'm sorry, I can't reach the variant list right now. Please try again later!",
        variantUnavailable:
            "I'm sorry, the variant %s is unavailable right now!",
        userQueued: "Successfully queued %s for recalculation (%s).",
        fullRecalcInProgress: "Successfully started recalculation.",
        fullRecalcSuccess: "%s, recalculation done!",
        userQueueList: "Recalculation Queue",
        playerIsArchived: "I'm sorry, this player is archived!",
    };
}
