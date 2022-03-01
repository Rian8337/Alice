import { Translation } from "@alice-localization/base/Translation";
import { FetchreplayStrings } from "../FetchreplayLocalization";

/**
 * The Indonesian translation for the `fetchreplay` command.
 */
export class FetchreplayIDTranslation extends Translation<FetchreplayStrings> {
    override readonly translations: FetchreplayStrings = {
        beatmapNotProvided: "",
        selfScoreNotFound: "",
        userScoreNotFound: "",
        noReplayFound: "",
        fetchReplayNoBeatmapSuccessful: "",
        playInfo: "",
        hitErrorInfo: "",
        hitErrorAvg: "",
    };
}
