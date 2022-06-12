import { Translation } from "@alice-localization/base/Translation";
import { LocaleStrings } from "../LocaleLocalization";

/**
 * The English translation for the `locale` command.
 */
export class LocaleENTranslation extends Translation<LocaleStrings> {
    override readonly translations: LocaleStrings = {
        selectLanguage: "Choose a language.",
        clearLocaleFailed: "I'm sorry, I couldn't clear the locale: %s.",
        clearLocaleSuccess: "Successfully cleared locale.",
        setLocaleFailed: "I'm sorry, I couldn't set the locale: %s.",
        setLocaleSuccess: "Successfully set locale.",
    };
}
