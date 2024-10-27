import { Translation } from "@localization/base/Translation";
import { DownloadlinkStrings } from "../DownloadlinkLocalization";

/**
 * The Korean translation for the `downloadlink` command.
 */
export class DownloadlinkKRTranslation extends Translation<DownloadlinkStrings> {
    override readonly translations: DownloadlinkStrings = {
        noCachedBeatmap: "죄송해요, 이 채널엔 캐시된 비트맵이 없어요!",
        beatmapNotAvailable:
            "죄송해요, 이 비트맵은 다운로드가 가능하지 않아요!",
    };
}
