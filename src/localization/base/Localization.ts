import { Language } from "./Language";
import { Translation } from "./Translation";

/**
 * Represents a localization for various things (commands, managers, database utilities, etc).
 */
export abstract class Localization<T extends Record<keyof T, string>> {
    /**
     * Available translations, mapped by language code (see {@link Language}).
     */
    protected abstract readonly translations: Readonly<Translation<T>>;

    /**
     * The language this localization is handling.
     */
    readonly language: Language;

    /**
     * @param language The language this localization is handling.
     */
    constructor(language: Language) {
        this.language = language;
    }

    /**
     * Gets the translation of a string literal, if available.
     *
     * @param name The name of the translation.
     * @param language The language to translate to. Defaults to English.
     * @returns The translated string literal, English if not available.
     */
    getTranslation(
        name: keyof T
    ): string {
        return (
            this.translations[this.language][name] ||
            this.translations["en"][name]
        );
    }
}
