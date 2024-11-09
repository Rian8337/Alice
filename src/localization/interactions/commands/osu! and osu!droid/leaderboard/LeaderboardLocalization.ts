import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { LeaderboardENTranslation } from "./translations/LeaderboardENTranslation";
import { LeaderboardESTranslation } from "./translations/LeaderboardESTranslation";
import { LeaderboardIDTranslation } from "./translations/LeaderboardIDTranslation";
import { LeaderboardKRTranslation } from "./translations/LeaderboardKRTranslation";

export interface LeaderboardStrings {
    readonly invalidPage: string;
    readonly dppLeaderboardClanNotFound: string;
    readonly noPrototypeEntriesFound: string;
    readonly noBeatmapFound: string;
    readonly username: string;
    readonly uid: string;
    readonly playCount: string;
    readonly pp: string;
    readonly accuracy: string;
}

/**
 * Localizations for the `leaderboard` command.
 */
export class LeaderboardLocalization extends Localization<LeaderboardStrings> {
    protected override readonly localizations: Readonly<
        Translations<LeaderboardStrings>
    > = {
        en: new LeaderboardENTranslation(),
        kr: new LeaderboardKRTranslation(),
        id: new LeaderboardIDTranslation(),
        es: new LeaderboardESTranslation(),
    };
}
