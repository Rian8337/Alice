import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { DanCourseENTranslation } from "./translations/DanCourseENTranslation";

export interface DanCourseStrings {
    readonly courseNotFound: string;
    readonly courseHasNoScores: string;
    readonly topScore: string;
    readonly noScoresSubmitted: string;
    readonly threeFingerOrNonPassScoresSubmitted: string;
    readonly userPassedDanCourseSuccess: string;
}

/**
 * Localizations for the `dancourse` command.
 */
export class DanCourseLocalization extends Localization<DanCourseStrings> {
    protected override readonly localizations: Readonly<
        Translations<DanCourseStrings>
    > = {
        en: new DanCourseENTranslation(),
    };
}
