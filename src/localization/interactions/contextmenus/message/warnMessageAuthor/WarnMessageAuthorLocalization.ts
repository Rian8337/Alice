import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { WarnMessageAuthorENTranslation } from "./translations/WarnMessageAuthorENTranslation";

export interface WarnMessageAuthorStrings {
    readonly selectPoints: string;
    readonly selectDuration: string;
    readonly warningConfirmation: string;
    readonly warnIssueFailed: string;
    readonly warnIssueSuccess: string;
    readonly warningReason: string;
}

/**
 * Localizations for the `warnMessageAuthor` context menu command.
 */
export class WarnMessageAuthorLocalization extends Localization<WarnMessageAuthorStrings> {
    protected override readonly localizations: Readonly<
        Translations<WarnMessageAuthorStrings>
    > = {
        en: new WarnMessageAuthorENTranslation(),
    };
}
