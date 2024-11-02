import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { UserbindENTranslation } from "./translations/UserbindENTranslation";
import { UserbindESTranslation } from "./translations/UserbindESTranslation";
import { UserbindIDTranslation } from "./translations/UserbindIDTranslation";
import { UserbindKRTranslation } from "./translations/UserbindKRTranslation";

export interface UserbindStrings {
    readonly profileNotFound: string;
    readonly incorrectEmail: string;
    readonly bindConfirmation: string;
    readonly discordAccountAlreadyBoundError: string;
    readonly bindError: string;
    readonly accountHasBeenBoundError: string;
    readonly bindSuccessful: string;
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
