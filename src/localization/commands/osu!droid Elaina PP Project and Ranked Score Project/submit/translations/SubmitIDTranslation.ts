import { Translation } from "@alice-localization/base/Translation";
import { SubmitStrings } from "../SubmitLocalization";

/**
 * The Indonesian translation for the `submit` command.
 */
export class SubmitIDTranslation extends Translation<SubmitStrings> {
    override readonly translations: SubmitStrings = {
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
        totalPP: "",
        ppGained: "",
        rankedScore: "",
        scoreGained: "",
        currentLevel: "",
        levelUp: "",
        scoreNeeded: "",
        ppSubmissionInfo: "",
        blacklistedBeatmapReject: "",
        unrankedBeatmapReject: "",
        beatmapTooShortReject: "",
        unrankedFeaturesReject: "",
        beatmapNotFoundReject: "",
    };
}
