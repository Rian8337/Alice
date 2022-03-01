import { Translation } from "@alice-localization/base/Translation";
import { CompareStrings } from "../CompareLocalization";

/**
 * The Indonesian translation for the `compare` command.
 */
export class CompareIDTranslation extends Translation<CompareStrings> {
    override readonly translations: CompareStrings = {
        tooManyOptions: "",
        noCachedBeatmap: "",
        playerNotFound: "",
        selfScoreNotFound: "",
        userScoreNotFound: "",
        comparePlayDisplay: "",
    };
}
