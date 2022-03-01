import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { WarningManagerENTranslation } from "./translations/WarningManagerENTranslation";
import { WarningManagerIDTranslation } from "./translations/WarningManagerIDTranslation";
import { WarningManagerKRTranslation } from "./translations/WarningManagerKRTranslation";

export interface WarningManagerStrings {
    readonly userIsImmune: string;
    readonly userNotFoundInServer: string;
    readonly invalidDuration: string;
    readonly durationOutOfRange: string;
    readonly notEnoughPermissionToWarn: string;
    readonly reasonTooLong: string;
    readonly warningIssued: string;
    readonly warningUnissued: string;
    readonly warningTransferred: string;
    readonly fromUser: string;
    readonly toUser: string;
    readonly warningId: string;
    readonly userId: string;
    readonly channelId: string;
    readonly warningIssueInChannel: string;
    readonly warnedUser: string;
    readonly inChannel: string;
    readonly warningReason: string;
    readonly warningUnissueReason: string;
    readonly reason: string;
    readonly points: string;
    readonly notSpecified: string;
    readonly warnIssueUserNotification: string;
    readonly warnUnissueUserNotification: string;
}

/**
 * Localizations for the `WarningManager` manager utility.
 */
export class WarningManagerLocalization extends Localization<WarningManagerStrings> {
    protected override readonly localizations: Readonly<
        Translations<WarningManagerStrings>
    > = {
        en: new WarningManagerENTranslation(),
        kr: new WarningManagerKRTranslation(),
        id: new WarningManagerIDTranslation(),
    };
}
