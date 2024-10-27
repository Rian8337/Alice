import { Translation } from "@localization/base/Translation";
import { MapShareStrings } from "../MapShareLocalization";

/**
 * The Korean translation for the `MapShare` database utility.
 */
export class MapShareKRTranslation extends Translation<MapShareStrings> {
    override readonly translations: MapShareStrings = {
        submissionNotAccepted: "제출이 아직 받아들여지지 않음",
        beatmapNotFound: "비트맵이 발견되지 않음",
        submitterNotBinded: "제출자가 바인딩되어있지 않음",
    };
}
