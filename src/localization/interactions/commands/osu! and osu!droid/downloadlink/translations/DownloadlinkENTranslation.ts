import { Translation } from "@localization/base/Translation";
import { DownloadlinkStrings } from "../DownloadlinkLocalization";

/**
 * The English translation for the `downloadlink` command.
 */
export class DownloadlinkENTranslation extends Translation<DownloadlinkStrings> {
    override readonly translations: DownloadlinkStrings = {
        noCachedBeatmap:
            "I'm sorry, there is no cached beatmap in this channel!",
        beatmapNotAvailable:
            "I'm sorry, this beatmap is not available for download!",
    };
}
