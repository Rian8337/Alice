import { Translation } from "@alice-localization/base/Translation";
import { PPStrings } from "../PPLocalization";

/**
 * The Indonesian translation for the `ppcheck` command.
 */
export class PPIDTranslation extends Translation<PPStrings> {
    override readonly translations: PPStrings = {
        tooManyOptions: "",
        cannotCompareSamePlayers: "",
        playerNotBinded: "",
        uid: "",
        username: "",
        user: "",
        noSimilarPlayFound: "",
        topPlaysComparison: "",
        player: "",
        totalPP: "",
        selfInfoNotAvailable: "",
        userInfoNotAvailable: "",
        ppProfileTitle: "",
        prevTotalPP: "",
        diff: "",
        ppProfile: "",
        lastUpdate: "",
        commandNotAllowed: "",
        uidIsBanned: "",
        beatmapNotFound: "",
        beatmapIsBlacklisted: "",
        beatmapNotWhitelisted: "",
        beatmapTooShort: "",
        noScoreSubmitted: "",
        noScoresInSubmittedList: "",
        scoreUsesForceAR: "",
        scoreUsesCustomSpeedMultiplier: "",
        submitSuccessful: "",
        profileNotFound: "",
        ppGained: "",
        ppSubmissionInfo: "",
        blacklistedBeatmapReject: "",
        unrankedBeatmapReject: "",
        beatmapTooShortReject: "",
        unrankedFeaturesReject: "",
        beatmapNotFoundReject: "",
    };
}
