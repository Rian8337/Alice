import { Translation } from "@alice-localization/base/Translation";
import { WhitelistManagerStrings } from "../WhitelistManagerLocalization";

/**
 * The Korean translation for the `WhitelistManager` manager utility.
 */
export class WhitelistManagerKRTranslation extends Translation<WhitelistManagerStrings> {
    override readonly translations: WhitelistManagerStrings = {
        beatmapIsBlacklisted: "비트맵이 이미 블랙리스트에 있음",
        beatmapIsNotBlacklisted: "비트맵이 블랙리스트에 없음",
        beatmapIsNotGraveyarded: "비트맵이 무덤에 간(graveyard)상태가 아님",
    };
}
