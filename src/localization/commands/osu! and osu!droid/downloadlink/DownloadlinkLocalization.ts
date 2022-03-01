import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { DownloadlinkENTranslation } from "./translations/DownloadlinkENTranslation";
import { DownloadlinkIDTranslation } from "./translations/DownloadlinkIDTranslation";
import { DownloadlinkKRTranslation } from "./translations/DownloadlinkKRTranslation";

export interface DownloadlinkStrings {
    readonly noCachedBeatmap: string;
    readonly beatmapNotAvailable: string;
}

/**
 * Localizations for the `downloadlink` command.
 */
export class DownloadlinkLocalization extends Localization<DownloadlinkStrings> {
    protected override readonly localizations: Readonly<
        Translations<DownloadlinkStrings>
    > = {
        en: new DownloadlinkENTranslation(),
        kr: new DownloadlinkKRTranslation(),
        id: new DownloadlinkIDTranslation(),
    };
}
