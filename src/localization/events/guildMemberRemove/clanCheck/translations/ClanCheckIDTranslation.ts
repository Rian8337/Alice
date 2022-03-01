import { Translation } from "@alice-localization/base/Translation";
import { ClanCheckStrings } from "../ClanCheckLocalization";

/**
 * The Indonesian translation for the `clanCheck` event utility for `guildMemberRemove` event.
 */
export class ClanCheckIDTranslation extends Translation<ClanCheckStrings> {
    override readonly translations: ClanCheckStrings = {
        memberKicked: "",
    };
}
