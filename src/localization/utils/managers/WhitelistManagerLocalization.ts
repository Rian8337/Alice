import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface WhitelistManagerStrings {
    readonly beatmapIsBlacklisted: string;
    readonly beatmapIsNotBlacklisted: string;
    readonly beatmapIsNotGraveyarded: string;
}

/**
 * Localizations for the `WhitelistManager` manager utility.
 */
export class WhitelistManagerLocalization extends Localization<WhitelistManagerStrings> {
    protected override readonly translations: Readonly<
        Translation<WhitelistManagerStrings>
    > = {
        en: {
            beatmapIsBlacklisted: "Beatmap is already blacklisted",
            beatmapIsNotBlacklisted: "Beatmap is not blacklisted",
            beatmapIsNotGraveyarded: "Beatmap is not graveyarded",
        },
    };
}
