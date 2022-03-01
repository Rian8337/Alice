import { Translation } from "@alice-localization/base/Translation";
import { CompareStrings } from "../CompareLocalization";

/**
 * The English translation for the `compare` command.
 */
export class CompareENTranslation extends Translation<CompareStrings> {
    override readonly translations: CompareStrings = {
        tooManyOptions:
            "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
        noCachedBeatmap:
            "I'm sorry, there is no beatmap being talked in the channel!",
        playerNotFound:
            "I'm sorry, I cannot find the player that you are looking for!",
        selfScoreNotFound:
            "I'm sorry, you have not submitted any scores in the beatmap!",
        userScoreNotFound:
            "I'm sorry, this user has not submitted any scores in the beatmap!",
        comparePlayDisplay: "Comparison play for %s:",
    };
}
