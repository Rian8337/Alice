import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { WarningENTranslation } from "./translations/WarningENTranslation";
import { WarningIDTranslation } from "./translations/WarningIDTranslation";
import { WarningKRTranslation } from "./translations/WarningKRTranslation";

export interface WarningStrings {
    readonly userNotFoundInServer: string;
    readonly warningNotFound: string;
    readonly noPermissionToViewWarning: string;
    readonly selfDontHaveWarnings: string;
    readonly userDontHaveWarnings: string;
    readonly cannotTransferToSamePerson: string;
    readonly warnIssueFailed: string;
    readonly warnIssueSuccess: string;
    readonly warnUnissueFailed: string;
    readonly warnUnissueSuccess: string;
    readonly warnTransferFailed: string;
    readonly warnTransferSuccess: string;
    readonly transferWarningConfirmation: string;
    readonly warningInfoForUser: string;
    readonly totalActivePoints: string;
    readonly totalWarnings: string;
    readonly lastWarning: string;
    readonly warningIssuer: string;
    readonly creationDate: string;
    readonly expirationDate: string;
    readonly channel: string;
}

/**
 * Localizations for the `warning` command.
 */
export class WarningLocalization extends Localization<WarningStrings> {
    protected override readonly localizations: Readonly<
        Translations<WarningStrings>
    > = {
        en: new WarningENTranslation(),
        kr: new WarningKRTranslation(),
        id: new WarningIDTranslation(),
    };
}
