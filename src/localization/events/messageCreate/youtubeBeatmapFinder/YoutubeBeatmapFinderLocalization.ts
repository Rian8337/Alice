import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { YoutubeBeatmapFinderENTranslation } from "./translations/YoutubeBeatmapFinderENTranslation";
import { YoutubeBeatmapFinderIDTranslation } from "./translations/YoutubeBeatmapFinderIDTranslation";
import { YoutubeBeatmapFinderKRTranslation } from "./translations/YoutubeBeatmapFinderKRTranslation";

export interface YoutubeBeatmapFinderStrings {
    readonly beatmapLimitation: string;
}

/**
 * Localizations for the `youtubeBeatmapFinder` event utility in `messageCreate` event.
 */
export class YoutubeBeatmapFinderLocalization extends Localization<YoutubeBeatmapFinderStrings> {
    protected override readonly localizations: Readonly<
        Translations<YoutubeBeatmapFinderStrings>
    > = {
        en: new YoutubeBeatmapFinderENTranslation(),
        kr: new YoutubeBeatmapFinderKRTranslation(),
        id: new YoutubeBeatmapFinderIDTranslation(),
    };
}
