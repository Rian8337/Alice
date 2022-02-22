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
        kr: {
            beatmapIsBlacklisted: "비트맵이 이미 블랙리스트에 있음",
            beatmapIsNotBlacklisted: "비트맵이 블랙리스트에 없음",
            beatmapIsNotGraveyarded: "비트맵이 무덤에 간(graveyard)상태가 아님",
        },
    };
}
