import { Translation } from "@alice-localization/base/Translation";
import { PoolStrings } from "../PoolLocalization";

export class PoolESTranslation extends Translation<PoolStrings> {
    override readonly translations: PoolStrings = {
        poolNotFound:
            "Lo siento, no puedo encontrar la lista de mapas que estas buscando!",
        mapNotFound: "",
        length: "Duración",
        beatmapHasNoScores: "",
        topScore: "",
    };
}
