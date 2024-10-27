import { Translation } from "@localization/base/Translation";
import { PoolStrings } from "../PoolLocalization";

/**
 * The English translation for the `pool` command.
 */
export class PoolENTranslation extends Translation<PoolStrings> {
    override readonly translations: PoolStrings = {
        poolNotFound:
            "I'm sorry, I cannot find the mappool that you are looking for!",
        length: "Length",
        maxScore: "Max Score",
        mapNotFound: "I'm sorry, I cannot find the beatmap!",
        beatmapHasNoScores:
            "I'm sorry, this beatmap doesn't have any scores submitted!",
        topScore: "Top Score",
    };
}
