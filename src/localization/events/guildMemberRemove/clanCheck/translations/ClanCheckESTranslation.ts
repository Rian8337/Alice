import { Translation } from "@alice-localization/base/Translation";
import { ClanCheckStrings } from "../ClanCheckLocalization";

/**
 * The Spanish translation for the `clanCheck` event utility for `guildMemberRemove` event.
 */
export class ClanCheckESTranslation extends Translation<ClanCheckStrings> {
    override readonly translations: ClanCheckStrings = {
        memberKicked:
            "Hey, el miembro (%s) se fue del servidor, por ende ha sido expulsado de tu clan!",
    };
}
