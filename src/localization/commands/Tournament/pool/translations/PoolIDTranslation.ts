import { Translation } from "@alice-localization/base/Translation";
import { PoolStrings } from "../PoolLocalization";

/**
 * The Indonesian translation for the `pool` command.
 */
export class PoolIDTranslation extends Translation<PoolStrings> {
    override readonly translations: PoolStrings = {
        poolNotFound: "",
        length: "",
        mapNotFound: "",
        beatmapHasNoScores: "",
        topScore: "",
    };
}
