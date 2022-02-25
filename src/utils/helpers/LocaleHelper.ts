import { Language } from "@alice-localization/base/Language";

/**
 * A helper class for locales.
 */
export abstract class LocaleHelper {
    /**
     * Converts a language into a BCP 47 language tag.
     *
     * @param language The language to convert.
     */
    static convertToBCP47(language: Language): string {
        switch (language) {
            case "kr":
                return "ko-KR";
            case "id":
                return "id-ID";
            default:
                return "en-US";
        }
    }
}
