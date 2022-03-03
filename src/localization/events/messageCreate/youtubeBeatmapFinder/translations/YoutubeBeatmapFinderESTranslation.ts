import { Translation } from "@alice-localization/base/Translation";
import { YoutubeBeatmapFinderStrings } from "../YoutubeBeatmapFinderLocalization";

/**
 * The Spanish translation for the `youtubeBeatmapFinder` event utility in `messageCreate` event.
 */
export class YoutubeBeatmapFinderESTranslation extends Translation<YoutubeBeatmapFinderStrings> {
    override readonly translations: YoutubeBeatmapFinderStrings = {
        beatmapLimitation:
            "Encontré %s mapas, pero solo puedo mostrar 3 debido a ciertas limitaciones.",
    };
}
