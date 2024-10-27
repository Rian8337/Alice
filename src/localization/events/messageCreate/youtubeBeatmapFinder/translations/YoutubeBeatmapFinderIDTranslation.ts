import { Translation } from "@localization/base/Translation";
import { YoutubeBeatmapFinderStrings } from "../YoutubeBeatmapFinderLocalization";

/**
 * The Indonesian translation for the `youtubeBeatmapFinder` event utility in `messageCreate` event.
 */
export class YoutubeBeatmapFinderIDTranslation extends Translation<YoutubeBeatmapFinderStrings> {
    override readonly translations: YoutubeBeatmapFinderStrings = {
        beatmapLimitation:
            "Aku menemukan %s beatmap, tetapi hanya menampilkan 3 karena keterbatasanku.",
    };
}
