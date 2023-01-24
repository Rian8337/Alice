import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ShowRecentPlaysENTranslation } from "./translations/ShowRecentPlaysENTranslation";
import { ShowRecentPlaysESTranslation } from "./translations/ShowRecentPlaysESTranslation";
import { ShowRecentPlaysIDTranslation } from "./translations/ShowRecentPlaysIDTranslation";
import { ShowRecentPlaysKRTranslation } from "./translations/ShowRecentPlaysKRTranslation";

export interface ShowRecentPlaysStrings {
    readonly userNotBinded: string;
    readonly profileNotFound: string;
}

/**
 * Localizations for the `showRecentPlays` button command.
 */
export class ShowRecentPlaysLocalization extends Localization<ShowRecentPlaysStrings> {
    protected override readonly localizations: Readonly<
        Translations<ShowRecentPlaysStrings>
    > = {
        en: new ShowRecentPlaysENTranslation(),
        es: new ShowRecentPlaysESTranslation(),
        id: new ShowRecentPlaysIDTranslation(),
        kr: new ShowRecentPlaysKRTranslation(),
    };
}
