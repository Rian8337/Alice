import { Translation } from "@localization/base/Translation";
import { WhitelistManagerStrings } from "../WhitelistManagerLocalization";

/**
 * The Spanish translation for the `WhitelistManager` manager utility.
 */
export class WhitelistManagerESTranslation extends Translation<WhitelistManagerStrings> {
    override readonly translations: WhitelistManagerStrings = {
        beatmapIsBlacklisted: "El mapa ya se encuentra vetado",
        invalidBeatmapDifficulty: "",
        beatmapIsNotBlacklisted: "El mapa no encuentra vetado",
        beatmapIsNotGraveyarded: "El mapa no se encuentra abandonado",
    };
}
