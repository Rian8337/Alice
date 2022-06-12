import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { UserbindENTranslation } from "./translations/UserbindENTranslation";
import { UserbindESTranslation } from "./translations/UserbindESTranslation";
import { UserbindIDTranslation } from "./translations/UserbindIDTranslation";
import { UserbindKRTranslation } from "./translations/UserbindKRTranslation";

export interface UserbindStrings {
    readonly profileNotFound: string;
    readonly newAccountBindNotInMainServer: string;
    readonly emailNotSpecified: string;
    readonly incorrectEmail: string;
    readonly newAccountUidBindConfirmation: string;
    readonly newAccountUsernameBindConfirmation: string;
    readonly newAccountUidBindSuccessful: string;
    readonly newAccountUsernameBindSuccessful: string;
    readonly accountUidBindError: string;
    readonly accountUsernameBindError: string;
    readonly accountHasBeenBindedError: string;
    readonly oldAccountUidBindSuccessful: string;
    readonly oldAccountUsernameBindSuccessful: string;
}

/**
 * Localizations for the `userbind` command.
 */
export class UserbindLocalization extends Localization<UserbindStrings> {
    protected override readonly localizations: Readonly<
        Translations<UserbindStrings>
    > = {
        en: new UserbindENTranslation(),
        kr: new UserbindKRTranslation(),
        id: new UserbindIDTranslation(),
        es: new UserbindESTranslation(),
    };
}
