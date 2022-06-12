import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ViewDroidProfileENTranslation } from "./translations/ViewDroidProfileENTranslation";
import { ViewDroidProfileESTranslation } from "./translations/ViewDroidProfileESTranslation";
import { ViewDroidProfileIDTranslation } from "./translations/ViewDroidProfileIDTranslation";
import { ViewDroidProfileKRTranslation } from "./translations/ViewDroidProfileKRTranslation";

export interface ViewDroidProfileStrings {
    readonly selfProfileNotFound: string;
    readonly userProfileNotFound: string;
    readonly viewingProfile: string;
}

/**
 * Localizations for the `viewDroidProfile` user context menu command.
 */
export class ViewDroidProfileLocalization extends Localization<ViewDroidProfileStrings> {
    protected override readonly localizations: Readonly<
        Translations<ViewDroidProfileStrings>
    > = {
        en: new ViewDroidProfileENTranslation(),
        es: new ViewDroidProfileESTranslation(),
        id: new ViewDroidProfileIDTranslation(),
        kr: new ViewDroidProfileKRTranslation(),
    };
}
