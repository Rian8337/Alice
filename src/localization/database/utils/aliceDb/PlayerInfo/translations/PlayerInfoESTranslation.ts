import { Translation } from "@localization/base/Translation";
import { PlayerInfoStrings } from "../PlayerInfoLocalization";

/**
 * The Spanish translation for the `PlayerInfo` database utility.
 */
export class PlayerInfoESTranslation extends Translation<PlayerInfoStrings> {
    override readonly translations: PlayerInfoStrings = {
        tooMuchCoinDeduction:
            "demasiada reducción de monedas; solo puedes resucir a lo mucho % monedas Alice",
        dailyClaimUsed: "la recompensa diaria ha sido usada",
        dailyLimitReached:
            "el monto a transferir sobrepasa el límite diario. Puedes transferir % monedas aun.",
    };
}
