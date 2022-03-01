import { Translation } from "@alice-localization/base/Translation";
import { LocaleStrings } from "../LocaleLocalization";

/**
 * The Korean translation for the `locale` command.
 */
export class LocaleKRTranslation extends Translation<LocaleStrings> {
    override readonly translations: LocaleStrings = {
        selectLanguage: "",
        clearLocaleFailed: "",
        clearLocaleSuccess: "",
        setLocaleFailed: "",
        setLocaleSuccess: "",
    };
}
