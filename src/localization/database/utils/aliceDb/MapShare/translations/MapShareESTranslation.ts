import { Translation } from "@localization/base/Translation";
import { MapShareStrings } from "../MapShareLocalization";

/**
 * The Spanish translation for the `MapShare` database utility.
 */
export class MapShareESTranslation extends Translation<MapShareStrings> {
    override readonly translations: MapShareStrings = {
        submissionNotAccepted: "registro aún no aceptado",
        beatmapNotFound: "mapa no encontrado",
        submitterNotBinded: "participante sin cuenta enlazada",
    };
}
