import { Translation } from "@alice-localization/base/Translation";
import { MapsearchStrings } from "../MapsearchLocalization";

/**
 * The Indonesian translation for the `mapsearch` command.
 */
export class MapsearchIDTranslation extends Translation<MapsearchStrings> {
    override readonly translations: MapsearchStrings = {
        requestFailed: "",
        noBeatmapsFound: "",
        serviceProvider: "",
        beatmapsFound: "",
        download: "",
        lastUpdate: "",
    };
}
