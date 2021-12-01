/**
 * Helper methods for strings.
 */
export abstract class StringHelper {
    /**
     * Capitalizes the beginning of a string.
     *
     * @param string The string to capitalize.
     * @param lowercaseRest Whether to lowercase the rest of the string.
     * @returns The capitalized string.
     */
    static capitalizeString(string: string, lowercaseRest?: boolean): string {
        if (string.length === 0) {
            return string;
        }

        const rest: string = string.slice(1);

        return (
            string.charAt(0).toUpperCase() +
            (lowercaseRest ? rest.toLowerCase() : rest)
        );
    }

    /**
     * Tidies a string, entering a new line on a whitespace if the specified
     * length is exceeded.
     *
     * Note that this function will trim _any_ whitespace-related characters.
     *
     * @param string The string to tidy.
     * @param maxLineLength The maximum amount of characters in a line.
     * @returns The tidied string.
     */
    static tidyString(string: string, maxLineLength: number): string {
        if (string.length <= maxLineLength) {
            return string;
        }

        let finalString: string = "";
        const words: string[] = string.split(/\s+/g);

        // There may be a word longer than the specified max length.
        // In that case, we use the longest word's length.
        let currentLineLength: number = 0;

        words.forEach((word) => {
            currentLineLength += word.length + 1;

            if (currentLineLength > maxLineLength) {
                finalString += "\n";
                currentLineLength = word.length + 1;
            }

            finalString += word + " ";
        });

        return finalString.trimRight();
    }

    /**
     * Obtains a section of a string, sliced by whitespace.
     *
     * @param str The string to slice.
     * @param wordIndexStart The word index to start slicing from.
     * @param wordIndexEnd The word index to end slicing to.
     * @returns The sliced string.
     */
    static getStringSection(
        str: string,
        wordIndexStart: number,
        wordIndexEnd?: number
    ): string {
        if (wordIndexEnd && wordIndexStart > wordIndexEnd) {
            throw new Error(
                "Start word index must be less than or equal to end word index"
            );
        }

        const split: string[] = str.split(/\s+/g);

        if (wordIndexStart > split.length - 1) {
            return "";
        }

        const index: number =
            split.slice(wordIndexStart, wordIndexEnd).join(" ").length + 1;

        return str.substring(index);
    }

    /**
     * Formats a string, replacing %s with placeholders.
     *
     * @param str The string to format.
     * @param replacements The replacements.
     * @returns The formatted string.
     */
    static formatString(str: string, ...replacements: string[]) {
        const replacementsNeeded: number = (str.match(/%s/g) || []).length;

        if (replacements.length !== replacementsNeeded) {
            throw new Error(
                `Amount of replacements for string "${str}" doesn't match; expected ${replacementsNeeded}, got ${replacements.length}`
            );
        }

        let count: number = 0;
        return str.replace(/%s/g, () => replacements[count++]);
    }

    /**
     * Gets the proper length of a unicode string.
     *
     * @param str The unicode string to get the proper length from.
     */
    static getUnicodeStringLength(str: string): number {
        // Standards: https://datatracker.ietf.org/doc/html/rfc3629|Reference

        let s: number = str.length;

        for (let i = str.length - 1; i >= 0; --i) {
            const code: number = str.charCodeAt(i);

            if (code > 0x7f && code <= 0x7ff) {
                ++s;
            } else if (code > 0x7ff && code <= 0xffff) {
                s += 2;
            }

            if (code >= 0xdc00 && code <= 0xdfff) {
                --i; //trail surrogate
            }
        }

        return s;
    }

    /**
     * Checks if a string is a valid hex code.
     *
     * @param str The string to check.
     */
    static isValidHexCode(str: string): boolean {
        return /^#[0-9A-F]{6}$/i.test(str);
    }

    /**
     * Checks if a link returns a valid image.
     *
     * @param link The link to check.
     * @returns Whether the link returns a valid image.
     */
    static isValidImage(link: string): boolean {
        if (!this.isValidURL(link)) {
            return false;
        }

        const length: number = link.length;

        return (
            link.indexOf("png", length - 3) !== -1 ||
            link.indexOf("jpg", length - 3) !== -1 ||
            link.indexOf("jpeg", length - 4) !== -1 ||
            link.indexOf("gif", length - 3) !== -1
        );
    }

    /**
     * Determines if a string is a valid URL.
     *
     * @param str The string to determine.
     */
    static isValidURL(str: string): boolean {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Checks if a string contains a unicode character.
     *
     * @param str The string.
     * @returns Whether the string contains a unicode character.
     */
    static hasUnicode(str: string): boolean {
        return [...str].some((v) => v.charCodeAt(0) > 127);
    }

    /**
     * Sorts a string alphabetically.
     *
     * @param str The string.
     * @returns The sorted string.
     */
    static sortAlphabet(str: string): string {
        return [...str].sort((a, b) => a.localeCompare(b)).join("");
    }
}
