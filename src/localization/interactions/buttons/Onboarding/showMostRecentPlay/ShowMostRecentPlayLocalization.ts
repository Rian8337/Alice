import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ShowMostRecentPlayENTranslation } from "./translations/ShowMostRecentPlayENTranslation";
import { ShowMostRecentPlayESTranslation } from "./translations/ShowMostRecentPlayESTranslation";
import { ShowMostRecentPlayIDTranslation } from "./translations/ShowMostRecentPlayIDTranslation";
import { ShowMostRecentPlayKRTranslation } from "./translations/ShowMostRecentPlayKRTranslation";

export interface ShowMostRecentPlayStrings {
    readonly userNotBinded: string;
    readonly profileNotFound: string;
    readonly playerHasNoRecentPlays: string;
    readonly recentPlayDisplay: string;
}

/**
 * Localizations for the `showMostRecentPlay` button command.
 */
export class ShowMostRecentPlayLocalization extends Localization<ShowMostRecentPlayStrings> {
    protected override readonly localizations: Readonly<
        Translations<ShowMostRecentPlayStrings>
    > = {
        en: new ShowMostRecentPlayENTranslation(),
        es: new ShowMostRecentPlayESTranslation(),
        id: new ShowMostRecentPlayIDTranslation(),
        kr: new ShowMostRecentPlayKRTranslation(),
    };
}
