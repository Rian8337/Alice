import { Translation } from "@localization/base/Translation";
import { MapShareStrings } from "../MapShareLocalization";

/**
 * The Indonesian translation for the `MapShare` database utility.
 */
export class MapShareIDTranslation extends Translation<MapShareStrings> {
    override readonly translations: MapShareStrings = {
        submissionNotAccepted: "",
        beatmapNotFound: "",
        submitterNotBinded: "",
    };
}
