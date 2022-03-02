import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { MapshareENTranslation } from "./translations/MapshareENTranslation";
import { MapshareESTranslation } from "./translations/MapshareESTranslation";
import { MapshareIDTranslation } from "./translations/MapshareIDTranslation";
import { MapshareKRTranslation } from "./translations/MapshareKRTranslation";

export interface MapshareStrings {
    readonly noSubmissionWithStatus: string;
    readonly noBeatmapFound: string;
    readonly noSubmissionWithBeatmap: string;
    readonly submissionIsNotPending: string;
    readonly userIsAlreadyBanned: string;
    readonly userIsNotBanned: string;
    readonly beatmapIsOutdated: string;
    readonly beatmapIsTooEasy: string;
    readonly beatmapHasLessThan50Objects: string;
    readonly beatmapHasNoCirclesOrSliders: string;
    readonly beatmapDurationIsLessThan30Secs: string;
    readonly beatmapIsWIPOrQualified: string;
    readonly beatmapWasJustSubmitted: string;
    readonly beatmapWasJustUpdated: string;
    readonly beatmapHasBeenUsed: string;
    readonly summaryWordCountNotValid: string;
    readonly summaryCharacterCountNotValid: string;
    readonly denyFailed: string;
    readonly denySuccess: string;
    readonly acceptFailed: string;
    readonly acceptSuccess: string;
    readonly banFailed: string;
    readonly banSuccess: string;
    readonly unbanFailed: string;
    readonly unbanSuccess: string;
    readonly postFailed: string;
    readonly postSuccess: string;
    readonly submitFailed: string;
    readonly submitSuccess: string;
    readonly statusAccepted: string;
    readonly statusDenied: string;
    readonly statusPending: string;
    readonly statusPosted: string;
    readonly submissionStatusList: string;
    readonly submissionFromUser: string;
    readonly userId: string;
    readonly beatmapId: string;
    readonly beatmapLink: string;
    readonly creationDate: string;
}

/**
 * Localizations for the `mapshare` command.
 */
export class MapshareLocalization extends Localization<MapshareStrings> {
    protected override readonly localizations: Readonly<
        Translations<MapshareStrings>
    > = {
        en: new MapshareENTranslation(),
        kr: new MapshareKRTranslation(),
        id: new MapshareIDTranslation(),
        es: new MapshareESTranslation(),
    };
}
