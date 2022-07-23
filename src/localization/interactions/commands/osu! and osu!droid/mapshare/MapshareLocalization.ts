import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { MapshareENTranslation } from "./translations/MapshareENTranslation";
import { MapshareESTranslation } from "./translations/MapshareESTranslation";
import { MapshareKRTranslation } from "./translations/MapshareKRTranslation";

export interface MapshareStrings {
    readonly noSubmissionWithStatus: string;
    readonly noBeatmapFound: string;
    readonly beatmapIsOutdated: string;
    readonly noSubmissionWithBeatmap: string;
    readonly submissionIsNotPending: string;
    readonly userIsAlreadyBanned: string;
    readonly userIsNotBanned: string;
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
    readonly submitModalTitle: string;
    readonly submitModalBeatmapLabel: string;
    readonly submitModalBeatmapPlaceholder: string;
    readonly submitModalSummaryLabel: string;
    readonly submitModalSummaryPlaceholder: string;
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
        es: new MapshareESTranslation(),
    };
}
