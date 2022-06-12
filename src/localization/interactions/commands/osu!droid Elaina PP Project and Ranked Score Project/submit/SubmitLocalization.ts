import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { SubmitENTranslation } from "./translations/SubmitENTranslation";
import { SubmitESTranslation } from "./translations/SubmitESTranslation";
import { SubmitIDTranslation } from "./translations/SubmitIDTranslation";
import { SubmitKRTranslation } from "./translations/SubmitKRTranslation";

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
    protected override readonly localizations: Readonly<
        Translations<SubmitStrings>
    > = {
        en: new SubmitENTranslation(),
        kr: new SubmitKRTranslation(),
        id: new SubmitIDTranslation(),
        es: new SubmitESTranslation(),
    };
}
