import { Translation } from "@alice-localization/base/Translation";
import { BlacklistStrings } from "../BlacklistLocalization";

/**
 * The Spanish translation for the `blacklist` command.
 */
export class BlacklistESTranslation extends Translation<BlacklistStrings> {
    override readonly translations: BlacklistStrings = {
        noBeatmapProvided: "",
        beatmapNotFound: "",
        noBlacklistReasonProvided: "",
        blacklistFailed: "",
        blacklistSuccess: "",
        unblacklistFailed: "",
        unblacklistSuccess: "",
        detectedBeatmapId:
            "ID del mapa detectado: %s. Elige la acción que desear realizar.",
        blacklist: "Veto",
        blacklistAction: "Veta el mapa",
        unblacklist: "Quitar veto",
        unblacklistAction: "Quitarle el veto al mapa",
    };
}
