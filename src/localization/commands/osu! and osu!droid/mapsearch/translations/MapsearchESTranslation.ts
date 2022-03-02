import { Translation } from "@alice-localization/base/Translation";
import { MapsearchStrings } from "../MapsearchLocalization";

/**
 * The Spanish translation for the `mapsearch` command.
 */
export class MapsearchESTranslation extends Translation<MapsearchStrings> {
    override readonly translations: MapsearchStrings = {
        requestFailed:
            "Lo siento, no pude encontrar tu busqueda del mapa en Sayobot!",
        noBeatmapsFound:
            "Lo siento, tu busqueda del mapa no genera ningun resultado!",
        serviceProvider: "Servicio proporcionado por Sayobot",
        beatmapsFound: "Mapas encontrados",
        download: "Descarga",
        lastUpdate: "Ultima actualización",
    };
}
