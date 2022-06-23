import { Translation } from "@alice-localization/base/Translation";
import { SubmitStrings } from "../SubmitLocalization";

/**
 * The English translation for the `submit` command.
 */
export class SubmitENTranslation extends Translation<SubmitStrings> {
    override readonly translations: SubmitStrings = {
        commandNotAllowed:
            "I'm sorry, this command is not available in this channel.",
        uidIsBanned:
            "I'm sorry, your currently binded osu!droid account has been disallowed from submitting dpp.",
        beatmapNotFound: "Hey, please give me a valid beatmap to submit!",
        beatmapIsBlacklisted: "I'm sorry, this beatmap has been blacklisted.",
        beatmapNotWhitelisted:
            "I'm sorry, the PP system only accepts ranked, approved, whitelisted, or loved beatmaps right now!",
        beatmapTooShort:
            "I'm sorry, this beatmap is either too short (less than 30 seconds) or doesn't have at least 60% of its music length mapped.",
        noScoreSubmitted:
            "I'm sorry, you don't have a score submitted in this beatmap!",
        noScoresInSubmittedList:
            "I'm sorry, you don't have any scores to submit within that range and offset!",
        scoreUsesForceAR: "I'm sorry, force AR is not allowed!",
        scoreUsesCustomSpeedMultiplier:
            "I'm sorry, custom speed multiplier is not allowed!",
        submitSuccessful:
            "Successfully submitted your play(s). More info in embed.",
        profileNotFound: "I'm sorry, I cannot find your profile!",
        totalPP: "Total PP",
        ppGained: "PP gained",
        ppSubmissionInfo: "PP submission info",
        blacklistedBeatmapReject: "Blacklisted beatmap",
        unrankedBeatmapReject: "Unranked beatmap",
        beatmapTooShortReject: "Beatmap too short",
        unrankedFeaturesReject: "Unranked features",
        beatmapNotFoundReject: "Beatmap not found",
    };
}
