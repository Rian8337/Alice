import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface DroidProfileStrings {
    readonly droidProfile: string;
}

/**
 * Localizations for the `droidProfile` event utility in `messageCreate` event.
 */
export class DroidProfileLocalization extends Localization<DroidProfileStrings> {
    protected override readonly translations: Readonly<
        Translation<DroidProfileStrings>
    > = {
        en: {
            droidProfile: "osu!droid profile for %s:",
        },
        kr: {
            droidProfile: "%s의 osu!droid 프로필:",
        },
    };
}
