import { Translation } from "@localization/base/Translation";
import { BlacklistStrings } from "../BlacklistLocalization";

/**
 * The Spanish translation for the `blacklist` command.
 */
export class BlacklistESTranslation extends Translation<BlacklistStrings> {
    override readonly translations: BlacklistStrings = {
        noBeatmapProvided:
            "Hey, por favor ingresa un mapa para vetar o quitar veto!",
        beatmapNotFound:
            "Hey, no puedo encontrar el mapa con el link o ID que mencionaste!",
        noBlacklistReasonProvided:
            "Hey, por favor ingresa una razon para vetar el mapa!",
        blacklistFailed: "Lo siento, no puedo vetar el mapa: `%s`.",
        blacklistSuccess: "`%s` vetado correctamente.",
        unblacklistFailed:
            "Lo siento, no puedo retirar el veto del mapa: `%s`.",
        unblacklistSuccess: "Veto retirado correctamente para `%s`.",
        detectedBeatmapId:
            "ID del mapa detectado: %s. Elige la acción que desear realizar.",
        blacklist: "Veto",
        blacklistAction: "Veta el mapa",
        unblacklist: "Quitar veto",
        unblacklistAction: "Quitarle el veto al mapa",
    };
}
