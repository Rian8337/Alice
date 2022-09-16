import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ActivityENTranslation } from "./translations/ActivityENTranslation";

export interface ActivityStrings {
    readonly serverBoostTierTooLow: string;
    readonly inviteLinkResponse: string;
}

/**
 * Localizations for the `activity` command.
 */
export class ActivityLocalization extends Localization<ActivityStrings> {
    protected override readonly localizations: Readonly<
        Translations<ActivityStrings>
    > = {
        en: new ActivityENTranslation(),
    };
}
