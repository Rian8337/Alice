import { Language } from "./Language";
import { Translations } from "./Translations";

/**
 * Represents a localization for various things (commands, managers, database utilities, etc).
 */
export abstract class Localization<T extends Record<keyof T, string>> {
    /**
     * Available localizations, mapped by language code (see {@link Language}).
     */
    protected abstract readonly localizations: Readonly<Translations<T>>;

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
    getTranslation(name: keyof T): string {
        return (
            this.localizations[this.language].translations[name] ||
            this.localizations.en.translations[name]
        );
    }
}
