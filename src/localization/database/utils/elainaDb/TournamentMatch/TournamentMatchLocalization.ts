import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { TournamentMatchENTranslation } from "./translations/TournamentMatchENTranslation";
import { TournamentMatchESTranslation } from "./translations/TournamentMatchESTranslation";
import { TournamentMatchKRTranslation } from "./translations/TournamentMatchKRTranslation";

export interface TournamentMatchStrings {
    readonly scoreNotFound: string;
    readonly modsIsNotUsed: string;
    readonly replayNotFound: string;
    readonly unsupportedGameVersion: string;
    readonly modsExceptNotUsed: string;
    readonly modsWasUsed: string;
    readonly teamMembersIncorrectFMmod: string;
}

/**
 * Localizations for the `TournamentMatch` database utility.
 */
export class TournamentMatchLocalization extends Localization<TournamentMatchStrings> {
    protected override readonly localizations: Readonly<
        Translations<TournamentMatchStrings>
    > = {
        en: new TournamentMatchENTranslation(),
        kr: new TournamentMatchKRTranslation(),
        es: new TournamentMatchESTranslation(),
    };
}
