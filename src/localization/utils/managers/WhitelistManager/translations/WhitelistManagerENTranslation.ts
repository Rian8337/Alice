import { Translation } from "@localization/base/Translation";
import { WhitelistManagerStrings } from "../WhitelistManagerLocalization";

/**
 * The English translation for the `WhitelistManager` manager utility.
 */
export class WhitelistManagerENTranslation extends Translation<WhitelistManagerStrings> {
    override readonly translations: WhitelistManagerStrings = {
        beatmapIsBlacklisted: "Beatmap is already blacklisted",
        invalidBeatmapDifficulty: "Beatmap difficulty is invalid",
        beatmapIsNotBlacklisted: "Beatmap is not blacklisted",
        beatmapIsNotGraveyarded: "Beatmap is not graveyarded",
    };
}
