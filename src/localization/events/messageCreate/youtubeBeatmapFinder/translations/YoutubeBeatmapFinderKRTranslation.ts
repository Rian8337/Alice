import { Translation } from "@alice-localization/base/Translation";
import { YoutubeBeatmapFinderStrings } from "../YoutubeBeatmapFinderLocalization";

/**
 * The Korean translation for the `youtubeBeatmapFinder` event utility in `messageCreate` event.
 */
export class YoutubeBeatmapFinderKRTranslation extends Translation<YoutubeBeatmapFinderStrings> {
    override readonly translations: YoutubeBeatmapFinderStrings = {
        beatmapLimitation:
            "%s개의 맵을 찾았지만, 제 한계로 인해 3개만 보여드려요.",
    };
}
