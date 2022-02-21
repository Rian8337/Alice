import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface LeaderboardStrings {
    readonly invalidPage: string;
    readonly dppLeaderboardClanNotFound: string;
    readonly noPrototypeEntriesFound: string;
    readonly noBeatmapFound: string;
    readonly beatmapHasNoScores: string;
    readonly topScore: string;
    readonly username: string;
    readonly uid: string;
    readonly playCount: string;
    readonly pp: string;
    readonly accuracy: string;
    readonly score: string;
}

/**
 * Localizations for the `leaderboard` command.
 */
export class LeaderboardLocalization extends Localization<LeaderboardStrings> {
    protected override readonly translations: Readonly<
        Translation<LeaderboardStrings>
    > = {
        en: {
            invalidPage: "Hey, please enter a valid page!",
            dppLeaderboardClanNotFound: "I'm sorry, I cannot find the clan!",
            noPrototypeEntriesFound:
                "I'm sorry, there are no scores in the prototype dpp database as of now!",
            noBeatmapFound: "Hey, please enter a valid beatmap link or ID!",
            beatmapHasNoScores:
                "I'm sorry, this beatmap doesn't have any scores submitted!",
            topScore: "Top Score",
            username: "Username",
            uid: "UID",
            playCount: "Play",
            pp: "PP",
            accuracy: "Accuracy",
            score: "Score",
        },
    };
}
