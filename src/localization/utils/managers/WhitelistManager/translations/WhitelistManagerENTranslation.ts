import { Translation } from "@alice-localization/base/Translation";
import { WhitelistManagerStrings } from "../WhitelistManagerLocalization";

/**
 * The English translation for the `WhitelistManager` manager utility.
 */
export class WhitelistManagerENTranslation extends Translation<WhitelistManagerStrings> {
    override readonly translations: WhitelistManagerStrings = {
        beatmapIsBlacklisted: "Beatmap is already blacklisted",
        beatmapIsNotBlacklisted: "Beatmap is not blacklisted",
        beatmapIsNotGraveyarded: "Beatmap is not graveyarded",
    };
}
