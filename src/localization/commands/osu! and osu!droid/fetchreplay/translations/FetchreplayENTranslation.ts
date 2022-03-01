import { Translation } from "@alice-localization/base/Translation";
import { FetchreplayStrings } from "../FetchreplayLocalization";

/**
 * The English translation for the `fetchreplay` command.
 */
export class FetchreplayENTranslation extends Translation<FetchreplayStrings> {
    override readonly translations: FetchreplayStrings = {
        beatmapNotProvided:
            "Hey, please enter the beatmap that I need to fetch the replay from!",
        selfScoreNotFound:
            "I'm sorry, you do not have a score submitted on that beatmap!",
        userScoreNotFound:
            "I'm sorry, that player does not have a score submitted on that beatmap!",
        noReplayFound: "I'm sorry, I cannot find the replay of the score!",
        fetchReplayNoBeatmapSuccessful:
            "Successfully fetched replay.\n\nRank: %s\nScore: %s\nMax Combo: %sx\nAccuracy: %s% [%s/%s/%s/%s]",
        playInfo: "Play Information for %s",
        hitErrorInfo: "Hit Error Information",
        hitErrorAvg: "hit error avg",
    };
}
