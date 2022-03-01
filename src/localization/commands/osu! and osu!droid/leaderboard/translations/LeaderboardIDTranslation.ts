import { Translation } from "@alice-localization/base/Translation";
import { LeaderboardStrings } from "../LeaderboardLocalization";

/**
 * The Indonesian translation for the `leaderboard` command.
 */
export class LeaderboardIDTranslation extends Translation<LeaderboardStrings> {
    override readonly translations: LeaderboardStrings = {
        invalidPage: "",
        dppLeaderboardClanNotFound: "",
        noPrototypeEntriesFound: "",
        noBeatmapFound: "",
        beatmapHasNoScores: "",
        topScore: "",
        username: "",
        uid: "",
        playCount: "",
        pp: "",
        accuracy: "",
        score: "",
    };
}
