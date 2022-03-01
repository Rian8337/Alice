import { Translation } from "@alice-localization/base/Translation";
import { PlayerInfoStrings } from "../PlayerInfoLocalization";

/**
 * The Indonesian translation for the `PlayerInfo` database utility.
 */
export class PlayerInfoIDTranslation extends Translation<PlayerInfoStrings> {
    override readonly translations: PlayerInfoStrings = {
        tooMuchCoinDeduction: "",
        dailyClaimUsed: "",
        dailyLimitReached: "",
    };
}
