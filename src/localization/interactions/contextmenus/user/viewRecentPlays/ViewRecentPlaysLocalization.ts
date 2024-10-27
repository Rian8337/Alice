import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { ViewRecentPlaysENTranslation } from "./translations/ViewRecentPlaysENTranslation";
import { ViewRecentPlaysESTranslation } from "./translations/ViewRecentPlaysESTranslation";
import { ViewRecentPlaysIDTranslation } from "./translations/ViewRecentPlaysIDTranslation";
import { ViewRecentPlaysKRTranslation } from "./translations/ViewRecentPlaysKRTranslation";

export interface ViewRecentPlaysStrings {
    readonly selfProfileNotFound: string;
    readonly userProfileNotFound: string;
    readonly playerHasNoRecentPlays: string;
}

/**
 * Localizations for the `viewRecentPlays` user context menu command.
 */
export class ViewRecentPlaysLocalization extends Localization<ViewRecentPlaysStrings> {
    protected override readonly localizations: Readonly<
        Translations<ViewRecentPlaysStrings>
    > = {
        en: new ViewRecentPlaysENTranslation(),
        es: new ViewRecentPlaysESTranslation(),
        id: new ViewRecentPlaysIDTranslation(),
        kr: new ViewRecentPlaysKRTranslation(),
    };
}
