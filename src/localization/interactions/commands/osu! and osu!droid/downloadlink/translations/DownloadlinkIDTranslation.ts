import { Translation } from "@alice-localization/base/Translation";
import { DownloadlinkStrings } from "../DownloadlinkLocalization";

/**
 * The Indonesian translation for the `downloadlink` command.
 */
export class DownloadlinkIDTranslation extends Translation<DownloadlinkStrings> {
    override readonly translations: DownloadlinkStrings = {
        noCachedBeatmap: "",
        beatmapNotAvailable: "",
    };
}
