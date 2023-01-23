import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { BindAccountActionENTranslation } from "./translations/BindAccountActionENTranslation";

export interface BindAccountActionStrings {
    readonly bindModalTitle: string;
    readonly bindModalEmailLabel: string;
    readonly bindModalEmailPlaceholder: string;
    readonly bindModalUsernameLabel: string;
    readonly bindModalUsernamePlaceholder: string;
}

/**
 * Localizations for the `bindAccountAction` button command.
 */
export class BindAccountActionLocalization extends Localization<BindAccountActionStrings> {
    protected override readonly localizations: Readonly<
        Translations<BindAccountActionStrings>
    > = {
        en: new BindAccountActionENTranslation(),
    };
}
