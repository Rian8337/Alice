import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface DownloadlinkStrings {
    readonly noCachedBeatmap: string;
    readonly beatmapNotAvailable: string;
}

/**
 * Localizations for the `downloadlink` command.
 */
export class DownloadlinkLocalization extends Localization<DownloadlinkStrings> {
    protected override readonly translations: Readonly<
        Translation<DownloadlinkStrings>
    > = {
        en: {
            noCachedBeatmap:
                "I'm sorry, there is no cached beatmap in this channel!",
            beatmapNotAvailable:
                "I'm sorry, this beatmap is not available for download!",
        },
    };
}
