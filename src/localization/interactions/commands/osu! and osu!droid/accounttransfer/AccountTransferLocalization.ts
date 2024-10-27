import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { AccountTransferENTranslation } from "./translations/AccountTransferENTranslation";

export interface AccountTransferStrings {
    readonly aboutEmbedTitle: string;
    readonly aboutEmbedDescription1: string;
    readonly aboutEmbedDescription2: string;
    readonly aboutEmbedDescription3: string;
    readonly aboutEmbedDescription4: string;
    readonly transferInfoEmbedTitle: string;
    readonly transferInfoEmbedTargetName: string;
    readonly transferInfoAccountListName: string;
    readonly playerNotFound: string;
    readonly noAccountTransfer: string;
    readonly incorrectEmail: string;
    readonly accountAlreadyAddedBySelf: string;
    readonly accountAlreadyAddedByOther: string;
    readonly accountNotInTransferList: string;
    readonly setTransferAccountFailed: string;
    readonly setTransferAccountSuccess: string;
    readonly addAccountFailed: string;
    readonly addAccountSuccess: string;
}

/**
 * Localizations for the `accountTransfer` slash command.
 */
export class AccountTransferLocalization extends Localization<AccountTransferStrings> {
    protected override readonly localizations: Readonly<
        Translations<AccountTransferStrings>
    > = {
        en: new AccountTransferENTranslation(),
    };
}
