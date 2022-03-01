import { Translation } from "@alice-localization/base/Translation";
import { GamestatsStrings } from "../GamestatsLocalization";

/**
 * The English translation for the `gamestats` command.
 */
export class GamestatsENTranslation extends Translation<GamestatsStrings> {
    override readonly translations: GamestatsStrings = {
        cannotRetrieveGameStatistics:
            "I'm sorry, I cannot retrieve game statistics!",
        overallGameStats: "Overall Game Statistics",
        registeredAccounts: "Registered Accounts",
        totalRegisteredAccounts: "Total",
        moreThan5ScoresAcc: "More than 5 scores",
        moreThan20ScoresAcc: "More than 20 scores",
        moreThan100ScoresAcc: "More than 100 scores",
        moreThan200ScoresAcc: "More than 200 scores",
        totalScores: "Total Online Scores",
    };
}
