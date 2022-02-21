import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface GamestatsStrings {
    readonly cannotRetrieveGameStatistics: string;
    readonly overallGameStats: string;
    readonly registeredAccounts: string;
    readonly totalRegisteredAccounts: string;
    readonly moreThan5ScoresAcc: string;
    readonly moreThan20ScoresAcc: string;
    readonly moreThan100ScoresAcc: string;
    readonly moreThan200ScoresAcc: string;
    readonly totalScores: string;
}

/**
 * Localizations for the `gamestats` command.
 */
export class GamestatsLocalization extends Localization<GamestatsStrings> {
    protected override readonly translations: Readonly<
        Translation<GamestatsStrings>
    > = {
        en: {
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
        },
    };
}
