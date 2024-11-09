import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { ViewTopPlaysENTranslation } from "./translations/ViewTopPlaysENTranslation";

export interface ViewTopPlaysStrings {
    readonly profileNotFound: string;
}

/**
 * Localizations for the `viewTopPlays` user context menu.
 */
export class ViewTopPlaysLocalization extends Localization<ViewTopPlaysStrings> {
    protected override readonly localizations: Readonly<
        Translations<ViewTopPlaysStrings>
    > = {
        en: new ViewTopPlaysENTranslation(),
    };
}
