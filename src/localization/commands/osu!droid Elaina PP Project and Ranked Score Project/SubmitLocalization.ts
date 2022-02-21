import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface SubmitStrings {
    readonly commandNotAllowed: string;
    readonly uidIsBanned: string;
    readonly beatmapNotFound: string;
    readonly beatmapIsBlacklisted: string;
    readonly beatmapNotWhitelisted: string;
    readonly beatmapTooShort: string;
    readonly noScoreSubmitted: string;
    readonly noScoresInSubmittedList: string;
    readonly scoreUsesForceAR: string;
    readonly scoreUsesCustomSpeedMultiplier: string;
    readonly submitSuccessful: string;
    readonly profileNotFound: string;
    readonly totalPP: string;
    readonly ppGained: string;
    readonly rankedScore: string;
    readonly scoreGained: string;
    readonly currentLevel: string;
    readonly levelUp: string;
    readonly scoreNeeded: string;
    readonly ppSubmissionInfo: string;
    readonly blacklistedBeatmapReject: string;
    readonly unrankedBeatmapReject: string;
    readonly beatmapTooShortReject: string;
    readonly unrankedFeaturesReject: string;
    readonly beatmapNotFoundReject: string;
}

/**
 * Localizations for the `submit` command.
 */
export class SubmitLocalization extends Localization<SubmitStrings> {
    protected override readonly translations: Readonly<Translation<SubmitStrings>> = {
        en: {
            commandNotAllowed: "I'm sorry, this command is not available in this channel.",
            uidIsBanned: "I'm sorry, your currently binded osu!droid account has been disallowed from submitting dpp.",
            beatmapNotFound: "Hey, please give me a valid beatmap to submit!",
            beatmapIsBlacklisted: "I'm sorry, this beatmap has been blacklisted.",
            beatmapNotWhitelisted: "I'm sorry, the PP system only accepts ranked, approved, whitelisted, or loved beatmaps right now!",
            beatmapTooShort: "I'm sorry, this beatmap is either too short (less than 30 seconds) or doesn't have at least 60% of its music length mapped.",
            noScoreSubmitted: "I'm sorry, you don't have a score submitted in this beatmap!",
            noScoresInSubmittedList: "I'm sorry, you don't have any scores to submit within that range and offset!",
            scoreUsesForceAR: "I'm sorry, force AR is not allowed!",
            scoreUsesCustomSpeedMultiplier: "I'm sorry, custom speed multiplier is not allowed!",
            submitSuccessful: "Successfully submitted your play(s). More info in embed.",
            profileNotFound: "I'm sorry, I cannot find your profile!",
            totalPP: "Total PP",
            ppGained: "PP gained",
            rankedScore: "Ranked score",
            scoreGained: "Score gained",
            currentLevel: "Current level",
            levelUp: "Level up!",
            scoreNeeded: "Score needed to level up",
            ppSubmissionInfo: "PP submission info",
            blacklistedBeatmapReject: "Blacklisted beatmap",
            unrankedBeatmapReject: "Unranked beatmap",
            beatmapTooShortReject: "Beatmap too short",
            unrankedFeaturesReject: "Unranked features",
            beatmapNotFoundReject: "Beatmap not found",
        }
    };
}