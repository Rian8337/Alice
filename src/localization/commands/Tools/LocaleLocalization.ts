import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface LocaleStrings {
    readonly selectLanguage: string;
    readonly clearLocaleFailed: string;
    readonly clearLocaleSuccess: string;
    readonly setLocaleFailed: string;
    readonly setLocaleSuccess: string;
}

/**
 * Localization for the `locale` command.
 */
export class LocaleLocalization extends Localization<LocaleStrings> {
    protected override readonly translations: Readonly<
        Translation<LocaleStrings>
    > = {
        en: {
            selectLanguage: "Choose a language.",
            clearLocaleFailed: "I'm sorry, I couldn't clear the locale: %s.",
            clearLocaleSuccess: "Successfully cleared locale.",
            setLocaleFailed: "I'm sorry, I couldn't set the locale: %s.",
            setLocaleSuccess: "Successfully set locale.",
        },
    };
}
