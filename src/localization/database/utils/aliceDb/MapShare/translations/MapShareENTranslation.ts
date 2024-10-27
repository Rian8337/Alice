import { Translation } from "@localization/base/Translation";
import { MapShareStrings } from "../MapShareLocalization";

/**
 * The English translation for the `MapShare` database utility.
 */
export class MapShareENTranslation extends Translation<MapShareStrings> {
    override readonly translations: MapShareStrings = {
        submissionNotAccepted: "submission is not accepted yet",
        beatmapNotFound: "beatmap not found",
        submitterNotBinded: "submitter is not bound",
    };
}
