import { Translation } from "@localization/base/Translation";
import { LeaderboardStrings } from "../LeaderboardLocalization";

/**
 * The English translation for the `leaderboard` command.
 */
export class LeaderboardENTranslation extends Translation<LeaderboardStrings> {
    override readonly translations: LeaderboardStrings = {
        invalidPage: "Hey, please enter a valid page!",
        dppLeaderboardClanNotFound: "I'm sorry, I cannot find the clan!",
        noPrototypeEntriesFound:
            "I'm sorry, there are no scores in the prototype dpp database as of now!",
        noBeatmapFound: "Hey, please enter a valid beatmap link or ID!",
        username: "Username",
        uid: "UID",
        playCount: "Play",
        pp: "PP",
        accuracy: "Accuracy",
    };
}
