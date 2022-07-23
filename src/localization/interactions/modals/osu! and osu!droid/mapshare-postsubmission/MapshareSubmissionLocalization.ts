import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { MapshareSubmissionENTranslation } from "./translations/MapshareSubmissionENTranslation";
import { MapshareSubmissionESTranslation } from "./translations/MapshareSubmissionESTranslation";
import { MapshareSubmissionKRTranslation } from "./translations/MapshareSubmissionKRTranslation";

export interface MapshareSubmissionStrings {
    readonly noBeatmapFound: string;
    readonly beatmapIsTooEasy: string;
    readonly beatmapHasLessThan50Objects: string;
    readonly beatmapHasNoCirclesOrSliders: string;
    readonly beatmapDurationIsLessThan30Secs: string;
    readonly beatmapIsWIPOrQualified: string;
    readonly beatmapWasJustSubmitted: string;
    readonly beatmapWasJustUpdated: string;
    readonly beatmapHasBeenUsed: string;
    readonly summaryWordCountNotValid: string;
    readonly submitFailed: string;
    readonly submitSuccess: string;
}

/**
 * Localizations for the `mapshare-submission` modal command.
 */
export class MapshareSubmissionLocalization extends Localization<MapshareSubmissionStrings> {
    protected override readonly localizations: Readonly<
        Translations<MapshareSubmissionStrings>
    > = {
        en: new MapshareSubmissionENTranslation(),
        es: new MapshareSubmissionESTranslation(),
        kr: new MapshareSubmissionKRTranslation(),
    };
}
