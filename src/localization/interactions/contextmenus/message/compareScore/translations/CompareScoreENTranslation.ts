import { Translation } from "@localization/base/Translation";
import { CompareScoreStrings } from "../CompareScoreLocalization";

/**
 * The English translation for the `compareScore` context menu command.
 */
export class CompareScoreENTranslation extends Translation<CompareScoreStrings> {
    override readonly translations: CompareScoreStrings = {
        beatmapNotFound:
            "I'm sorry, I cannot find the beatmap that you are looking for!",
        profileNotFound: "I'm sorry, I cannot find your profile!",
        scoreNotFound:
            "I'm sorry, you have not submitted any scores in the beatmap!",
        comparePlayDisplay: "Comparison play for %s:",
    };
}
