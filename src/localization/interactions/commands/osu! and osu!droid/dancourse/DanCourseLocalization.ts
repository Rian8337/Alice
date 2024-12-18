import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { DanCourseENTranslation } from "./translations/DanCourseENTranslation";

export interface DanCourseStrings {
    readonly courseNotFound: string;
    readonly courseHasNoScores: string;
    readonly topScore: string;
    readonly noScoresSubmitted: string;
    readonly threeFingerOrNonPassScoresSubmitted: string;
    readonly userPassedDanCourseFailed: string;
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
