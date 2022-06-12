import { Translation } from "@alice-localization/base/Translation";
import { CalculateStrings } from "../CalculateLocalization";

/**
 * The Spanish translation for the `calculate` command.
 */
export class CalculateESTranslation extends Translation<CalculateStrings> {
    override readonly translations: CalculateStrings = {
        noBeatmapProvided:
            "Hey, no hay ningun mapa siendo tema de conversación en este canal! Por favor, envia uno!",
        beatmapProvidedIsInvalid: "Hey, por favor envia un mapa válido!",
        beatmapNotFound:
            "Lo siento, no puedo encontrar el mapa que estas buscando!",
        rawDroidSr: "Raw droid stars",
        rawDroidPp: "Raw droid pp",
        rawPcSr: "Raw PC stars",
        rawPcPp: "Raw PC pp",
    };
}
