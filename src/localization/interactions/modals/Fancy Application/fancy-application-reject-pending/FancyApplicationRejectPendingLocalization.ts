import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { FancyApplicationRejectPendingENTranslation } from "./translations/FancyApplicationRejectPendingENTranslation";

export interface FancyApplicationRejectPendingStrings {
    readonly applicationNotFound: string;
    readonly applicationNotPending: string;
    readonly applicationRejectFailed: string;
    readonly applicationRejectSuccess: string;
}

/**
 * Localizations for the `fancy-application-reject-pending` modal command.
 */
export class FancyApplicationRejectPendingLocalization extends Localization<FancyApplicationRejectPendingStrings> {
    protected override readonly localizations: Readonly<
        Translations<FancyApplicationRejectPendingStrings>
    > = {
        en: new FancyApplicationRejectPendingENTranslation(),
    };
}
