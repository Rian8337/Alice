import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { NamechangeENTranslation } from "./translations/NamechangeENTranslation";
import { NamechangeESTranslation } from "./translations/NamechangeESTranslation";
import { NamechangeKRTranslation } from "./translations/NamechangeKRTranslation";

export interface NamechangeStrings {
    readonly userNotBindedToUid: string;
    readonly noActiveRequest: string;
    readonly invalidUid: string;
    readonly uidHasNoActiveRequest: string;
    readonly userHasNoActiveRequest: string;
    readonly newNameAlreadyTaken: string;
    readonly activeRequestExists: string;
    readonly requestCooldownNotExpired: string;
    readonly currentBindedAccountDoesntExist: string;
    readonly newUsernameContainsInvalidCharacters: string;
    readonly newUsernameTooLong: string;
    readonly emailNotEqualToBindedAccount: string;
    readonly requestSuccess: string;
    readonly userHasNoHistory: string;
    readonly acceptFailed: string;
    readonly acceptSuccess: string;
    readonly cancelFailed: string;
    readonly cancelSuccess: string;
    readonly denyFailed: string;
    readonly denySuccess: string;
    readonly nameHistoryForUid: string;
    readonly nameHistory: string;
    readonly nameChangeRequestList: string;
    readonly discordAccount: string;
    readonly usernameRequested: string;
    readonly creationDate: string;
}

/**
 * Localizations for the `namechange` command.
 */
export class NamechangeLocalization extends Localization<NamechangeStrings> {
    protected override readonly localizations: Readonly<
        Translations<NamechangeStrings>
    > = {
        en: new NamechangeENTranslation(),
        kr: new NamechangeKRTranslation(),
        es: new NamechangeESTranslation(),
    };
}
