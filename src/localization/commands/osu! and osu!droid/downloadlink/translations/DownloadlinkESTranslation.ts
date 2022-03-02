import { Translation } from "@alice-localization/base/Translation";
import { DownloadlinkStrings } from "../DownloadlinkLocalization";

/**
 * The Spanish translation for the `downloadlink` command.
 */
export class DownloadlinkESTranslation extends Translation<DownloadlinkStrings> {
    override readonly translations: DownloadlinkStrings = {
        noCachedBeatmap:
            "Lo siento, no hay ningun mapa proporcionado en este canal!",
        beatmapNotAvailable:
            "Lo siento, este mapa no esta disponible para descargar!",
    };
}
