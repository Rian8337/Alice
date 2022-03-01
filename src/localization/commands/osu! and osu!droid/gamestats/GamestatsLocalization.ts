import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { GamestatsENTranslation } from "./translations/GamestatsENTranslation";
import { GamestatsIDTranslation } from "./translations/GamestatsIDTranslation";
import { GamestatsKRTranslation } from "./translations/GamestatsKRTranslation";

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
    protected override readonly localizations: Readonly<
        Translations<GamestatsStrings>
    > = {
        en: new GamestatsENTranslation(),
        kr: new GamestatsKRTranslation(),
        id: new GamestatsIDTranslation(),
    };
}
