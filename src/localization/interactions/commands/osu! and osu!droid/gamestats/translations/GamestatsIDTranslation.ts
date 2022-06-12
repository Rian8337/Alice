import { Translation } from "@alice-localization/base/Translation";
import { GamestatsStrings } from "../GamestatsLocalization";

/**
 * The Indonesian translation for the `gamestats` command.
 */
export class GamestatsIDTranslation extends Translation<GamestatsStrings> {
    override readonly translations: GamestatsStrings = {
        cannotRetrieveGameStatistics: "",
        overallGameStats: "",
        registeredAccounts: "",
        totalRegisteredAccounts: "",
        moreThan5ScoresAcc: "",
        moreThan20ScoresAcc: "",
        moreThan100ScoresAcc: "",
        moreThan200ScoresAcc: "",
        totalScores: "",
    };
}
