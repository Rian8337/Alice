import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { FancyApplicationRejectENTranslation } from "./translations/FancyApplicationRejectPendingENTranslation";

export interface FancyApplicationRejectPendingStrings {
    readonly modalTitle: string;
    readonly reasonLabel: string;
    readonly reasonPlaceholder: string;
}

/**
 * Localizations for the `fancyApplicationRejectPending` button command.
 */
export class FancyApplicationRejectPendingLocalization extends Localization<FancyApplicationRejectPendingStrings> {
    protected override readonly localizations: Readonly<
        Translations<FancyApplicationRejectPendingStrings>
    > = {
        en: new FancyApplicationRejectENTranslation(),
    };
}
