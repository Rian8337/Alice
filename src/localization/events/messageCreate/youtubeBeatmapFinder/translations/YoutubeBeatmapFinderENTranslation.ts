import { Translation } from "@localization/base/Translation";
import { YoutubeBeatmapFinderStrings } from "../YoutubeBeatmapFinderLocalization";

/**
 * The English translation for the `youtubeBeatmapFinder` event utility in `messageCreate` event.
 */
export class YoutubeBeatmapFinderENTranslation extends Translation<YoutubeBeatmapFinderStrings> {
    override readonly translations: YoutubeBeatmapFinderStrings = {
        beatmapLimitation:
            "I found %s maps, but only displaying up to 3 due to my limitations.",
    };
}
