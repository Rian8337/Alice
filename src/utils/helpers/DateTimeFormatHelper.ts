import { Language } from "@alice-localization/base/Language";
import { DateTimeFormatHelperLocalization } from "@alice-localization/utils/helpers/DateTimeFormatHelperLocalization";

/**
 * Helper methods for processing custom time formats and dates.
 */
export abstract class DateTimeFormatHelper {
    /**
     * Converts seconds into `w days, x hours, y minutes, z seconds` format.
     *
     * @param seconds The amount of seconds to convert.
     * @returns The formatted date.
     */
    static secondsToDHMS(seconds: number, language: Language = "en"): string {
        const localization: DateTimeFormatHelperLocalization =
            this.getLocalization(language);

        seconds = Math.trunc(seconds);

        const days: number = Math.floor(seconds / 86400);
        seconds -= days * 86400;

        const hours: number = Math.floor(seconds / 3600);
        seconds -= hours * 3600;

        const minutes: number = Math.floor(seconds / 60);
        seconds -= minutes * 60;

        const final: string[] = [
            `${days} ${localization.getTranslation(days > 1 ? "days" : "day")}`,
            `${hours} ${localization.getTranslation(
                hours > 1 ? "hours" : "hour"
            )}`,
            `${minutes} ${localization.getTranslation(
                minutes > 1 ? "minutes" : "minute"
            )}`,
            `${seconds} ${localization.getTranslation(
                seconds > 1 ? "seconds" : "second"
            )}`,
        ];

        return (
            final.filter((v) => !v.startsWith("0")).join(", ") ||
            `0 ${localization.getTranslation("seconds")}`
        );
    }

    /**
     * Converts a DD:HH:MM:SS time format or DHMS time format into seconds.
     *
     * Example formats:
     * - 6:01:24:33
     * - 2d14h55m34s
     *
     * @param dhms The time format to be converted.
     * @returns The converted time format in seconds.
     */
    static DHMStoSeconds(dhms: string): number {
        let time: number = 0;
        const timeEntry: string[] = dhms.toLowerCase().split(/[dhms:]/g);

        if (/[dhms]/g.test(dhms)) {
            // Contains either "d", "h", "m", or "s",
            // used to prevent duplicate entry
            const usedFormats: string[] = [];
            for (let i = 0, mark = 0; i < dhms.length; ++i) {
                if (isNaN(time)) {
                    break;
                }
                const str: string = dhms.charAt(i);
                if (/[dhms]/.test(str) && !usedFormats.includes(str)) {
                    if (mark === i) {
                        ++mark;
                        continue;
                    }
                    usedFormats.push(str);
                    const currentTime: number = parseFloat(dhms.slice(mark, i));
                    mark = i + 1;

                    let multiplier = 1;
                    switch (str) {
                        case "d":
                            multiplier = 86400;
                            break;
                        case "h":
                            multiplier = 3600;
                            break;
                        case "m":
                            multiplier = 60;
                            break;
                    }

                    time += currentTime * multiplier;
                }
            }
        } else {
            for (let i = timeEntry.length - 1, multiplier = 1; i >= 0; --i) {
                switch (i) {
                    case timeEntry.length - 4:
                        multiplier *= 24;
                        break;
                    case timeEntry.length - 3:
                    case timeEntry.length - 2:
                        multiplier *= 60;
                        break;
                    default:
                        // Limit up to days
                        multiplier = Number.NaN;
                }
                if (isNaN(multiplier) || isNaN(time)) {
                    break;
                }
                time += parseFloat(timeEntry[i]) * multiplier;
            }
        }

        return time;
    }

    /**
     * Converts a date object into human-readable string.
     *
     * @param date The date to convert.
     * @returns The converted string.
     */
    static dateToHumanReadable(date: Date): string {
        const str: string = date.toUTCString();

        return str.split(" ").slice(1, 4).join(" ");
    }

    /**
     * Gets the difference between the specified time and current time in milliseconds.
     *
     * A negative return value means the specified time is in the past.
     *
     * @param time The time.
     * @returns The difference between the specified time and current time in milliseconds.
     */
    static getTimeDifference(time: Date | number): number {
        if (time instanceof Date) {
            return time.getTime() - Date.now();
        } else {
            return time - Date.now();
        }
    }

    /**
     * Converts a date to its string literal.
     *
     * @param date The date.
     * @param language The language to convert to.
     * @returns The formatted date.
     */
    static dateToLocaleString(date: Date, language: Language): string {
        let localeToConvert: string;

        switch (language) {
            case "kr":
                localeToConvert = "ko-KR";
                break;
            case "id":
                localeToConvert = "id-ID";
                break;
            default:
                localeToConvert = "en-US";
        }

        return date.toLocaleString(localeToConvert, { timeZone: "UTC" });
    }

    /**
     * Gets the localization of this helper utility.
     *
     * @param language The language to localize.
     */
    private static getLocalization(
        language: Language
    ): DateTimeFormatHelperLocalization {
        return new DateTimeFormatHelperLocalization(language);
    }
}
