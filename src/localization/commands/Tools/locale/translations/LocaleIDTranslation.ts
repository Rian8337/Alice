import { Translation } from "@alice-localization/base/Translation";
import { LocaleStrings } from "../LocaleLocalization";

/**
 * The Indonesian translation for the `locale` command.
 */
export class LocaleIDTranslation extends Translation<LocaleStrings> {
    override readonly translations: LocaleStrings = {
        selectLanguage: "",
        clearLocaleFailed: "",
        clearLocaleSuccess: "",
        setLocaleFailed: "",
        setLocaleSuccess: "",
    };
}
