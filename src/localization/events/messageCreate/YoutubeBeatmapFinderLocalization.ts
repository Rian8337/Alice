import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface YoutubeBeatmapFinderStrings {
    readonly beatmapLimitation: string;
}

/**
 * Localizations for the `youtubeBeatmapFinder` event utility in `messageCreate` event.
 */
export class YoutubeBeatmapFinderLocalization extends Localization<YoutubeBeatmapFinderStrings> {
    protected override readonly translations: Readonly<
        Translation<YoutubeBeatmapFinderStrings>
    > = {
        en: {
            beatmapLimitation:
                "I found %s maps, but only displaying up to 3 due to my limitations.",
        },
    };
}
